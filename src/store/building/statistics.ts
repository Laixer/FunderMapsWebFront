import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type IStatistics } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';


function useStatistics() {
  /**
   * Whether to show the statistics modal
   */
  const showStatisticsModal = ref(false)

  /**
   * The statistics graph to display
   */
  const statisticsGraph: Ref<string|null> = ref(null)

  /**
   * Statistics data by Building Id
   */
  const statisticsDataByBuildingId: Ref<Record<string, IStatistics>> = ref({})

  /**
   * Whether currently data for a building is being loaded
   */
  const isLoadingBuildingDataById: Ref<Record<string, boolean>> = ref({})

  /**
   * List of buildingIds that failed to load, along with info about the reason
   */
  const failedToLoadByBuildingId: Ref<Record<string, { reason: number }>> = ref({})

  const buildingStatisticsDataHasBeenRetrieved = function buildingStatisticsDataHasBeenRetrieved(buildingId: string): boolean {
    return buildingId in statisticsDataByBuildingId.value
  }

  const buildingStatisticsDataFailedToLoad = function buildingStatisticsDataFailedToLoad(buildingId: string): boolean {
    return buildingId in failedToLoadByBuildingId.value
  }

  const buildingHasStatisticsData = function buildingHasStatisticsData(buildingId: string): boolean {
    return buildingStatisticsDataHasBeenRetrieved(buildingId) && !! statisticsDataByBuildingId.value[buildingId]
  }

  const getStatisticsDataByBuildingId = function getStatisticsDataByBuildingId(buildingId: string): IStatistics|null {
    if (! buildingHasStatisticsData(buildingId)) return null
    return statisticsDataByBuildingId.value[buildingId]
  }

  const loadStatisticsDataByBuildingId = async function loadStatisticsDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) return
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingStatisticsDataHasBeenRetrieved(buildingId)) return

      const response: IStatistics = await api.building.getStatisticsByBuildingId(buildingId)
      statisticsDataByBuildingId.value[buildingId] = response || null

    } catch(e) {
      console.error("Failed to load statistics data", buildingId, e)
      failedToLoadByBuildingId.value[buildingId] = { reason: 404 }
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearStatisticsData = function clearStatisticsData() {
    statisticsDataByBuildingId.value = {}
    isLoadingBuildingDataById.value = {}
    failedToLoadByBuildingId.value = {}
  }

  /**
   * Clean up statistics data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearStatisticsData()
      }
    }
  )

  return {
    buildingStatisticsDataHasBeenRetrieved,
    buildingStatisticsDataFailedToLoad,
    buildingHasStatisticsData,
    getStatisticsDataByBuildingId,

    loadStatisticsDataByBuildingId,

    showStatisticsModal,
    statisticsGraph
  }
}


export const useStatisticsStore = defineStore(
  'statistics',
  useStatistics
)
