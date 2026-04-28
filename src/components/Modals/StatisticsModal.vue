<script setup lang="ts">
import { computed, nextTick, watch, type Component } from 'vue'
import { storeToRefs } from 'pinia'

import OverlayModal from '@/components/Common/OverlayModal.vue'

import BarChart from '@/components/Modals/Statistics/BarChart.vue'
import PieChart from '@/components/Modals/Statistics/PieChart.vue'
import ScatterChart from '@/components/Modals/Statistics/ScatterChart.vue'
import HorizontalBarChart from '@/components/Modals/Statistics/HorizontalBarChart.vue'

import { useBuildingStore } from '@/store/buildings'
import { useStatisticsStore } from '@/store/building/statistics'
import { useSubsidenceStore } from '@/store/building/subsidence'
import type {
  IConstructionYearPair,
  IFoundationTypePair,
  IIncidentYearPair,
  IInquiryYearPair,
} from '@/datastructures/interfaces/api/IStatistics'
import { CHART_PALETTE, CHART_PALETTE_SOFT } from './Statistics/chartDefaults'

const { buildingId } = storeToRefs(useBuildingStore())
const statisticsStore = useStatisticsStore()
const { showStatisticsModal, scrollToSection } = storeToRefs(statisticsStore)
const subsidenceStore = useSubsidenceStore()

const buildingStatistics = computed(() => {
  if (!buildingId.value) return null
  return statisticsStore.getData(buildingId.value)
})

const subsidenceData = computed(() => {
  if (!buildingId.value) return []
  return subsidenceStore.getData(buildingId.value)
})

// Foundation type buckets: collapse the 18 raw enum values to 5 user-facing
// categories. Index 0..4 corresponds to the labels below.
const foundationTypeBuckets = computed<number[]>(() => {
  const stats = buildingStatistics.value?.foundationTypeDistribution?.foundationTypes ?? []
  const out = [0, 0, 0, 0, 0]
  for (const pair of stats as IFoundationTypePair[]) {
    switch (pair.foundationType) {
      case 3: case 11: case 12: case 13: out[0] += pair.percentage; break
      case 10: out[1] += pair.percentage; break
      case 0: case 1: case 2: case 15: case 16: case 17:
        out[2] += pair.percentage; break
      case 4: case 5: case 6: case 7: case 8: case 9:
        out[3] += pair.percentage; break
      default: out[4] += pair.percentage
    }
  }
  return out
})

const riskColors = (labels: string[]): string[] => {
  const map: Record<string, string> = {
    'Label A': CHART_PALETTE.green,
    'Label B': CHART_PALETTE_SOFT.green,
    'Label C': CHART_PALETTE.yellow,
    'Label D': CHART_PALETTE.orange,
    'Label E': CHART_PALETTE.red,
  }
  return labels.map(l => map[l] ?? CHART_PALETTE.grey)
}

interface Section {
  key: string
  title: string
  // Typed as Component (not union of specific charts) so the dynamic
  // <component :is="..."> render doesn't try to enforce the most-strict
  // intersection of all chart prop types — the data shape varies per
  // chart and is validated by the chart components themselves.
  component: Component
  labels: string[]
  data: number[] | { x: number; y: number; r: number }[]
  backgroundColors: string[]
  borderColors: string[]
}

// All chart sections rendered in the modal, in display order. Sections
// where data is absent are filtered out. Conditional incident/report
// pairs prefer neighborhood-level data, falling back to municipality.
const sections = computed<Section[]>(() => {
  const stats = buildingStatistics.value
  if (!stats) return []

  const out: Section[] = []

  if (subsidenceData.value && subsidenceData.value.length > 0) {
    out.push({
      key: 'displacement',
      title: 'Pandzakkingssnelheid (mm)',
      component: ScatterChart,
      labels: [],
      data: subsidenceData.value.map(item => ({
        x: Date.parse(item.markAt),
        y: item.velocity,
        r: 2,
      })),
      backgroundColors: [CHART_PALETTE.navy],
      borderColors: [CHART_PALETTE.navy],
    })
  }

  out.push({
    key: 'foundationTypeDistribution',
    title: 'Verhouding funderingstype in de buurt',
    component: PieChart,
    labels: ['Betonnen', 'Houten paal met betonoplanger', 'Houten palen', 'Niet onderheid', 'Overige'],
    data: foundationTypeBuckets.value,
    backgroundColors: [CHART_PALETTE.grey, CHART_PALETTE.yellow, CHART_PALETTE.orange,
      CHART_PALETTE.red, CHART_PALETTE.blue],
    borderColors: [],
  })

  const decades = stats.constructionYearDistribution?.decades ?? []
  if (decades.length > 0) {
    out.push({
      key: 'constructionYearDistribution',
      title: 'Aantal bouwjaren per decennia in de buurt',
      component: BarChart,
      labels: decades.map((d: IConstructionYearPair) =>
        `${d.decade.yearFrom.substring(0, 4)}-${d.decade.yearTo.substring(0, 4)}`),
      data: decades.map((d: IConstructionYearPair) => d.totalCount),
      backgroundColors: Object.values(CHART_PALETTE_SOFT),
      borderColors: Object.values(CHART_PALETTE),
    })
  }

  if (stats.foundationRiskDistribution) {
    const riskLabels = Object.keys(stats.foundationRiskDistribution)
      .map(k => `Label ${k.replace('percentage', '')}`)
    out.push({
      key: 'foundationRiskDistribution',
      title: 'Verhouding funderingsrisico in de buurt',
      component: PieChart,
      labels: riskLabels,
      data: Object.values(stats.foundationRiskDistribution),
      backgroundColors: riskColors(riskLabels),
      borderColors: [],
    })
  }

  const incidentSource = stats.totalIncidentCount.length > 0
    ? { rows: stats.totalIncidentCount, scope: 'buurt' as const }
    : stats.municipalityIncidentCount.length > 0
      ? { rows: stats.municipalityIncidentCount, scope: 'gemeente' as const }
      : null
  if (incidentSource) {
    out.push({
      key: 'incidentCount',
      title: `Aantal incidenten per jaar in de ${incidentSource.scope}`,
      component: HorizontalBarChart,
      labels: incidentSource.rows.map((d: IIncidentYearPair) => String(d.year)),
      data: incidentSource.rows.map((d: IIncidentYearPair) => d.totalCount),
      backgroundColors: Object.values(CHART_PALETTE_SOFT),
      borderColors: Object.values(CHART_PALETTE),
    })
  }

  const reportSource = stats.totalReportCount.length > 0
    ? { rows: stats.totalReportCount, scope: 'buurt' as const }
    : stats.municipalityReportCount.length > 0
      ? { rows: stats.municipalityReportCount, scope: 'gemeente' as const }
      : null
  if (reportSource) {
    out.push({
      key: 'reportCount',
      title: `Aantal onderzoeken per jaar in de ${reportSource.scope}`,
      component: HorizontalBarChart,
      labels: reportSource.rows.map((d: IInquiryYearPair) => String(d.year)),
      data: reportSource.rows.map((d: IInquiryYearPair) => d.totalCount),
      backgroundColors: Object.values(CHART_PALETTE_SOFT),
      borderColors: Object.values(CHART_PALETTE),
    })
  }

  return out
})

// When the modal opens with a target section, scroll it into view after
// the DOM has rendered. Map legacy keys to the new merged section keys.
const sectionAlias: Record<string, string> = {
  totalIncidentCount: 'incidentCount',
  municipalityIncidentCount: 'incidentCount',
  totalReportCount: 'reportCount',
  municipalityReportCount: 'reportCount',
}

watch(showStatisticsModal, async open => {
  if (!open) return
  await nextTick()
  const target = scrollToSection.value
  if (!target) return
  const id = sectionAlias[target] ?? target
  document.getElementById(`stats-section-${id}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  scrollToSection.value = null
})

const handleClose = (): void => {
  showStatisticsModal.value = false
}
</script>

<template>
  <OverlayModal
    v-if="showStatisticsModal && buildingStatistics"
    title="Statistieken"
    @close="handleClose">
    <div class="space-y-10">
      <section
        v-for="section in sections"
        :id="`stats-section-${section.key}`"
        :key="section.key"
        class="space-y-4 scroll-mt-4"
      >
        <h5 class="heading-5">{{ section.title }}</h5>
        <div class="h-80">
          <component
            :is="section.component"
            :title="section.title"
            :labels="section.labels"
            :data="section.data"
            :background-colors="section.backgroundColors"
            :border-colors="section.borderColors"
          />
        </div>
      </section>

      <p v-if="sections.length === 0" class="text-sm text-grey-700">
        Er zijn geen statistieken beschikbaar voor dit pand.
      </p>
    </div>
  </OverlayModal>
</template>
