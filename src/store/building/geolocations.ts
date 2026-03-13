import { defineStore } from 'pinia'

import { type IGeoLocationData } from "@/datastructures/interfaces"
import api from '@/services/api'
import { GeoLocationData } from '@/datastructures/classes/Location/LocationData'
import { createBuildingDataLoader } from './createBuildingDataLoader'


export const useGeoLocationsStore = defineStore('geolocations', () => {
  const { hasBeenRetrieved, failedToLoad, hasData, getData, loadData } =
    createBuildingDataLoader<IGeoLocationData>(
      'location',
      api.building.getLocationInformationByBuildingId,
      (response) => response ? new GeoLocationData(response) : null
    )

  function getFullAddress(buildingId: string): string | null {
    const location = getData(buildingId)
    return location?.address?.fullAddress || null
  }

  function getAddress(buildingId: string): string | null {
    const location = getData(buildingId)
    if (location?.address?.street) {
      return `${location.address.street} ${location.address.buildingNumber}`.trim()
    }
    return null
  }

  return {
    hasBeenRetrieved,
    failedToLoad,
    hasData,
    getData,
    loadData,
    getFullAddress,
    getAddress,
  }
})
