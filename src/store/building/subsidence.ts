import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type ISubsidence } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';


function useSubsidence() {
  /**
   * Subsidence data by Building Id
   */
  const subsidenceDataByBuildingId: Ref<Record<string, ISubsidence[]>> = ref({})

  /**
   * Whether currently data for a building is being loaded
   */
  const isLoadingBuildingDataById: Ref<Record<string, boolean>> = ref({})

  /**
   * List of buildingIds that failed to load, along with info about the reason
   */
  const failedToLoadByBuildingId: Ref<Record<string, { reason: number }>> = ref({})

  const buildingSubsidenceDataHasBeenRetrieved = function buildingSubsidenceDataHasBeenRetrieved(buildingId: string): boolean {
    return buildingId in subsidenceDataByBuildingId.value
  }

  const buildingSubsidenceDataFailedToLoad = function buildingSubsidenceDataFailedToLoad(buildingId: string): boolean {
    return buildingId in failedToLoadByBuildingId.value
  }

  const buildingHasSubsidenceData = function buildingHasSubsidenceData(buildingId: string): boolean {
    return buildingSubsidenceDataHasBeenRetrieved(buildingId) && !! subsidenceDataByBuildingId.value[buildingId]
  }

  const getSubsidenceDataByBuildingId = function getSubsidenceDataByBuildingId(buildingId: string): ISubsidence[]|null {
    if (! buildingHasSubsidenceData(buildingId)) return null
    return subsidenceDataByBuildingId.value[buildingId]
  }

  const loadSubsidenceDataByBuildingId = async function loadSubsidenceDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) return
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingSubsidenceDataHasBeenRetrieved(buildingId)) return

      const response: ISubsidence[] = await api.building.getSubsidenceByBuildingId(buildingId)
      subsidenceDataByBuildingId.value[buildingId] = response || null

    } catch(e) {
      console.error("Failed to load subsidence data", buildingId, e)
      failedToLoadByBuildingId.value[buildingId] = { reason: 404 }
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearSubsidenceData = function clearSubsidenceData() {
    subsidenceDataByBuildingId.value = {}
    isLoadingBuildingDataById.value = {}
    failedToLoadByBuildingId.value = {}
  }

  /**
   * Clean up subsidence data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearSubsidenceData()
      }
    }
  )

  return {
    buildingSubsidenceDataHasBeenRetrieved,
    buildingSubsidenceDataFailedToLoad,
    buildingHasSubsidenceData,
    getSubsidenceDataByBuildingId,

    loadSubsidenceDataByBuildingId
  }
}


export const useSubsidenceStore = defineStore(
  'subsidence',
  useSubsidence
)
