import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'

import { type IStatistics } from "@/datastructures/interfaces"
import api from '@/services/api'
import { createBuildingDataLoader } from './createBuildingDataLoader'


export const useStatisticsStore = defineStore('statistics', () => {
  const showStatisticsModal = ref(false)
  const statisticsGraph: Ref<string | null> = ref(null)

  const { hasBeenRetrieved, failedToLoad, hasData, getData, loadData } =
    createBuildingDataLoader<IStatistics>('statistics', api.building.getStatisticsByBuildingId)

  return {
    hasBeenRetrieved,
    failedToLoad,
    hasData,
    getData,
    loadData,
    showStatisticsModal,
    statisticsGraph,
  }
})
