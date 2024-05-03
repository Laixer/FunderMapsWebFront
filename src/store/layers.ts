
import { getItemsStartingWith } from '@/utils/sessionStorage'
import { defineStore, storeToRefs} from 'pinia'
import { Ref, ref } from 'vue'

import { useMapsetStore } from '@/store/mapsets'

// A full session storage key = prefix + mapsetId
const sessionStorageKeyPrefix = 'layer_visibility_'

/**
 * Arrays of visible layers per mapsetId
 */
const visibleLayersByMapsetId: Ref<{[key: string]: string[]}> = ref({})

/**
 * Get all visible layers by mapsetId
 */
const getVisibleLayersByMapsetId = function getVisibleLayersByMapsetId(id: string): string[] {
  return id && visibleLayersByMapsetId.value[id] ? visibleLayersByMapsetId.value[id] : []
}

/**
 * Shortcut to get all visible layers of the active mapset
 */
const getVisibleLayersOfActiveMapset = function getVisibleLayersOfActiveMapset(): string[] {
  const { activeMapsetId } = storeToRefs(useMapsetStore())

  return activeMapsetId.value 
    ? getVisibleLayersByMapsetId(activeMapsetId.value) 
    : []
}

/**
 * Whether a layer is visible within a mapset context
 */
const isLayerVisible = function(layerId: string, mapsetId: string) {
  return !! visibleLayersByMapsetId.value?.[mapsetId]?.includes(layerId)
}

/**
 * Load the layer visibility information of all mapsets from sessionStorage
 *  Only needs to be done once at bootup
 */
const retrieveLayerVisibilityFromSessionStorage = function retrieveLayerVisibilityFromSessionStorage() {
  const visibilityPerMapset = getItemsStartingWith(sessionStorageKeyPrefix)
  Object.keys(visibilityPerMapset).forEach(key => {
    const id = key.split(sessionStorageKeyPrefix).join('')
    visibleLayersByMapsetId.value[id] = JSON.parse(visibilityPerMapset[key])
  })
}

/**
 * Change the visibility of a layer, and keep track of the change in session storage
 */
const changeLayerVisibility = function changeLayerVisibility(layerId: string, visibility: boolean, mapsetId?: string|null|undefined) {

  if (! mapsetId) {
    const { activeMapsetId } = storeToRefs(useMapsetStore())
    if (activeMapsetId.value === null) {
      throw new Error("Missing mapset id while changing layer visiblity")
    }

    mapsetId = activeMapsetId.value
  }

  // Get the current list of visibile layers, or a empty list
  const current = getVisibleLayersByMapsetId(mapsetId) 

  // Always remove the passed layerId, to avoid duplicates when adding the layerId.
  const future = current.filter(id => id !== layerId)
  if (visibility === true) {
    future.push(layerId)
  }
  // visibility === false? The layerId is already removed

  // Make the future now
  visibleLayersByMapsetId.value[mapsetId] = future

  // Keep track of the list in session storage
  sessionStorage.setItem(
    `${sessionStorageKeyPrefix}${mapsetId}`, 
    JSON.stringify(future)
  )
}

/**
 * Toggle the visibility of a layer. 
 */
const toggleLayerVisibility = function toggleLayerVisibility(layerId: string, mapsetId?: string|undefined) {
  if (! mapsetId) {
    const { activeMapsetId } = storeToRefs(useMapsetStore())
    if (activeMapsetId.value === null) {
      throw new Error("Missing mapset id while changing layer visiblity")
    }

    mapsetId = activeMapsetId.value
  }
  
  changeLayerVisibility(
    layerId, 
    ! getVisibleLayersByMapsetId(mapsetId).includes(layerId), 
    mapsetId
  )
}


function useLayers() {
  return {
    visibleLayersByMapsetId,
    isLayerVisible,
    retrieveLayerVisibilityFromSessionStorage,
    getVisibleLayersByMapsetId,
    getVisibleLayersOfActiveMapset,
    changeLayerVisibility,
    toggleLayerVisibility
  }
}


export const useLayersStore = defineStore(
  'layers',
  useLayers
)