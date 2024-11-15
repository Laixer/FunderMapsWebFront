<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BuildingIdHeader from '@/components/BuildingIdHeader.vue';
import BackLink from '../Common/Links/BackLink.vue';

import BlockLinkGroup from '@/components/Common/Links/BlockLinkGroup.vue';
import BlockLink from '@/components/Common/Links/BlockLink.vue'


import { useStatisticsStore } from '@/store/building/statistics';

import { useBuildingStore } from '@/store/buildings';
const { getStatisticsDataByBuildingId } = useStatisticsStore()
const { showStatisticsModal, statisticsGraph } = storeToRefs(useStatisticsStore())
const { buildingId } = storeToRefs(useBuildingStore())
/**
 * Props & events
 */ 
const emit = defineEmits(['close', 'back'])

/**
 * Used to determine whether to show neighborhood or municipality level graphs
 */
const buildingStatistics = computed(() => {
  if (! buildingId.value) return null
  return getStatisticsDataByBuildingId(buildingId.value)
})
const noTotalIncidentCount = computed(() => {
  if (! buildingStatistics.value) return false
  return buildingStatistics.value.totalIncidentCount.length === 0
})
const noTotalReportCount = computed(() => {
  if (! buildingStatistics.value) return false
  return buildingStatistics.value.totalReportCount.length === 0
})


/**
 * Open the statistics modal
 */
const handleOpenChart = function handleOpenChart(name: string) {
  console.log("Open chart", name)
  statisticsGraph.value = name
  showStatisticsModal.value = true
}

</script>

<template>
  <Panel 
    title="Statistiek" 
    icon="graph"
    @close="emit('close')">

    <Transition>
      <BuildingIdHeader />
    </Transition>

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <BlockLinkGroup>
        <BlockLink 
          title="Pandzakkingssnelheid (mm/jaar)"
          label="Bekijk grafiek"
          @click="handleOpenChart('displacement')" />

        <BlockLink 
          title="Verhouding aantal fundering in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('foundationTypeDistribution')" />
        <BlockLink 
          title="Aantal bouwjaren per decennia in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('constructionYearDistribution')" />
        <BlockLink 
          title="Verhouding funderingsrisico in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('foundationRiskDistribution')" />

        <!-- Not yet graph data
          
        <BlockLink 
          title="Aantal herstel panden per jaar in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('totalBuildingRestoredCount')" /> -->

        <!-- conditional -->
        <BlockLink 
          v-if="! noTotalIncidentCount"
          title="Aantal incidenten per jaar in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('totalIncidentCount')" />
        <BlockLink 
          v-else
          title="Aantal incidenten per jaar in de gemeente"
          label="Bekijk grafiek"
          @click="handleOpenChart('municipalityIncidentCount')" />

        <!-- conditional -->
        <BlockLink 
          v-if="! noTotalReportCount"
          title="Aantal onderzoeken per jaar in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('totalReportCount')" />
        <BlockLink 
          v-else
          title="Aantal onderzoeken per jaar in de gemeente"
          label="Bekijk grafiek"
          @click="handleOpenChart('municipalityReportCount')" />

      </BlockLinkGroup>
    </section>
  </Panel>
</template>