
import { type Ref, ref, computed } from 'vue';
import { defineStore } from 'pinia'

import { useGeoLocationsStore } from './building/geolocations';

const buildingId: Ref<string|null> = ref(null)

/**
 * Whether a building is selected
 */
const hasSelectedBuilding = computed<boolean>(() => {
  return buildingId.value !== null
})

/**
 * Select a building to be shown in the right sidebar
 */
const setBuildingId = function setBuildingId(id: string) {

  // A quick debug override
  const debugBuildingId = localStorage.getItem('debugBuildingId')
  buildingId.value = debugBuildingId || id
}

/**
 * Deselect the building
 */
const clearBuildingId = function clearBuildingId() {
  buildingId.value = null
}


function useBuildings() {

  const { buildingLocationDataHasBeenRetrieved } = useGeoLocationsStore()

  /**
   * Whether all building related information is retrieved
   *  TODO: Is this even important? 
   */
  const hasRetrievedAllBuildingRelatedData = function(id: string|null = null): boolean {
    id = id ? id : buildingId.value 

    if (! id) return false

    return buildingLocationDataHasBeenRetrieved(id)
  }

  return {
    buildingId,
    hasSelectedBuilding,

    hasRetrievedAllBuildingRelatedData,

    setBuildingId,
    clearBuildingId
  }
}


export const useBuildingStore = defineStore(
  'buildings',
  useBuildings
)

