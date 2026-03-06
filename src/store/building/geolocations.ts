import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type IGeoLocationData } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';
import { GeoLocationData } from '@/datastructures/classes/Location/LocationData';


function useGeoLocations() {
  /**
   * Location data by Building Id
   */
  const locationDataByBuildingId: Ref<Record<string, IGeoLocationData|null>> = ref({})

  /**
   * Whether currently data for a building is being loaded
   */
  const isLoadingBuildingDataById: Ref<Record<string, boolean>> = ref({})

  /**
   * List of buildingIds that failed to load, along with info about the reason
   */
  const failedToLoadByBuildingId: Ref<Record<string, { reason: number }>> = ref({})

  const buildingLocationDataHasBeenRetrieved = function buildingLocationDataHasBeenRetrieved(buildingId: string): boolean {
    return buildingId in locationDataByBuildingId.value
  }

  const buildingLocationDataFailedToLoad = function buildingLocationDataFailedToLoad(buildingId: string): boolean {
    return buildingId in failedToLoadByBuildingId.value
  }

  const buildingHasLocationData = function buildingHasLocationData(buildingId: string): boolean {
    return buildingLocationDataHasBeenRetrieved(buildingId) && !! locationDataByBuildingId.value[buildingId]
  }

  const getLocationDataByBuildingId = function getLocationDataByBuildingId(buildingId: string): IGeoLocationData|null {
    if (! buildingHasLocationData(buildingId)) return null
    return locationDataByBuildingId.value[buildingId]
  }

  const getFullAddressByBuildingId = function getFullAddressByBuildingId(buildingId: string): string|null {
    const location = getLocationDataByBuildingId(buildingId)
    return location?.address?.fullAddress || null
  }

  const getAddressByBuildingId = function getAddressByBuildingId(buildingId: string) : string|null {
    const location = getLocationDataByBuildingId(buildingId)
    if (location?.address?.street) {
      return `${location?.address?.street} ${location?.address?.buildingNumber}`.trim()
    }
    return null
  }

  const loadLocationDataByBuildingId = async function loadLocationDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) {
        return
      }
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingLocationDataHasBeenRetrieved(buildingId)) {
        return
      }

      const response: IGeoLocationData = await api.building.getLocationInformationByBuildingId(buildingId)

      locationDataByBuildingId.value[buildingId] = response
        ? new GeoLocationData(response)
        : null

    } catch(e) {
      console.error("Failed to load location data", buildingId, e)
      failedToLoadByBuildingId.value[buildingId] = { reason: 404 }
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearGeoLocationInformation = function clearGeoLocationInformation() {
    locationDataByBuildingId.value = {}
    isLoadingBuildingDataById.value = {}
    failedToLoadByBuildingId.value = {}
  }

  /**
   * Clean up geo location data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearGeoLocationInformation()
      }
    }
  )

  return {
    buildingLocationDataHasBeenRetrieved,
    buildingHasLocationData,
    buildingLocationDataFailedToLoad,
    getLocationDataByBuildingId,
    getFullAddressByBuildingId,
    getAddressByBuildingId,

    loadLocationDataByBuildingId
  }
}


export const useGeoLocationsStore = defineStore(
  'geolocations',
  useGeoLocations
)
