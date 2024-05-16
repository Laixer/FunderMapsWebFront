<script setup lang="ts">
import { type ComputedRef, computed, type Component  } from 'vue';
import { storeToRefs } from 'pinia';

import OverlayModal from '@/components/Common/OverlayModal.vue'

import BarChart from '@/components/Modals/Statistics/BarChart.vue'
import PieChart from '@/components/Modals/Statistics/PieChart.vue'
import HorizontalBarChart from '@/components/Modals/Statistics/HorizontalBarChart.vue'

import { useStatisticsStore } from '@/store/building/statistics';

const { showStatisticsModal, statisticsGraph } = storeToRefs(useStatisticsStore())

const emit = defineEmits(['close'])

interface IComponents {
    [key: string]: Component
}
const availableChartComponents: IComponents = {
  BarChart,
  PieChart,
  HorizontalBarChart
}

/**
 * The chart title, based on the statistic name
 */
const title: ComputedRef<string> = computed(() => {
  switch(statisticsGraph.value) {
    case 'foundationTypeDistribution': 
      return 'Verhouding funderingstype in de buurt'

    case 'constructionYearDistribution':
      return 'Aantal bouwjaren per decennia in de buurt'

    case 'foundationRiskDistribution':
      return 'Verhouding funderingsrisico in de buurt'

    case 'totalBuildingRestoredCount':
      return 'Aantal herstel panden per jaar in de buurt'

    case 'totalIncidentCount':
      return 'Aantal incidenten per jaar in de buurt'

    case 'municipalityIncidentCount':
      return 'Aantal incidenten per jaar in de gemeente'
  
    case 'totalReportCount':
      return 'Aantal onderzoeken per jaar in de buurt'

    case 'municipalityReportCount':
      return 'Aantal onderzoeken per jaar in de gemeente'
  }

  return 'Statistiek'
})

/**
 * The graph type, based on the statistic name
 */
const chartComponentName: ComputedRef<string>  = computed(() => {
  switch(statisticsGraph.value) {
    case 'foundationTypeDistribution': 
    case 'foundationRiskDistribution':
      return 'PieChart'
    
    case 'constructionYearDistribution':
      return 'BarChart'

    case 'totalBuildingRestoredCount':
    case 'totalIncidentCount':
    case 'municipalityIncidentCount':
    case 'totalReportCount':
    case 'municipalityReportCount':
      return 'HorizontalBarChart'
  }

  return ''
})

const labels = computed(() => {
  return ['red', 'blue', 'yellow']
})

const data = computed(() => {
  return [300, 200, 600]
})


const handleClose = function handleClose() {
  showStatisticsModal.value = false
  
}

</script>

<template>
  <OverlayModal 
    v-if="showStatisticsModal"
    :title="title"
    class="xl:pointer-events-none xl:bg-transparent"
    @close="handleClose">
    <div 
      v-if="chartComponentName !== ''"
      class="w-full">
      <component 
        :is="availableChartComponents[chartComponentName]" 
        :labels="labels"
        :data="data"
      />
    </div>
  </OverlayModal>
</template>