import { ref } from 'vue'
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

  /**
   * Street and number per address id (BAG nummeraanduiding). The location
   * data above holds one address per pand; a report can have samples on
   * several addresses of a pand, and names them by this.
   *  null = asked, no address found
   */
  const addressLabelById = ref<Record<string, string | null>>({})
  const addressLabelRequested = new Set<string>()

  function getAddressLabel(addressId: string): string | null {
    return addressLabelById.value[addressId] ?? null
  }

  async function loadAddressLabel(addressId: string): Promise<void> {
    if (! addressId || addressLabelRequested.has(addressId)) return
    addressLabelRequested.add(addressId)

    try {
      addressLabelById.value[addressId] = await api.building.getAddressLabelById(addressId)
    } catch {
      // Not found, or the lookup failed: the sample keeps its number as name
      addressLabelById.value[addressId] = null
    }
  }

  return {
    hasBeenRetrieved,
    failedToLoad,
    hasData,
    getData,
    loadData,
    getFullAddress,
    getAddress,
    getAddressLabel,
    loadAddressLabel,
  }
})
