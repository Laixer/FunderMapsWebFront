
import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs} from 'pinia'
import { refDebounced } from '@vueuse/core'

import { type IMapsetFE } from '@/datastructures/interfaces';

import api from '@/services/api'
import { computed } from '@vue/reactivity';

import { useSessionStore } from '@/store/session'

/**
 * The map groups available to the user
 *  TODO: Store by id instead of as array ?
 */
const availableMapsets: Ref<IMapsetFE[]> = ref([])

/**
 * Used to indicate whether map groups are loaded
 */
const hasAvailableMapsets = computed<boolean>(() => {
  return availableMapsets.value.length !== 0
})

/**
 * Has mapsets available, and at least is not public
 */
const hasAvailablePrivateMapsets = computed<boolean>(() => {
  return hasAvailableMapsets.value 
    && availableMapsets.value.some(mapset => mapset.public !== true)
})


/**
 * Whether currently mapset information is being retrieved
 */
const isLoadingMapsets = ref(false)
const isLoadingMapsetsDebounced = refDebounced(isLoadingMapsets, 25)

/**
 * Used to indicate whether retrieving the mapset provided no results
 */
const noMapsetsFound = computed(() => {
  return isLoadingMapsets.value === false && hasAvailableMapsets.value === false
})

/**
 * Used to indicate a specifically requested mapset could not be retrieved
 */
const requestedMapsetNotFound = ref(false)

/**
 * The currently selected map group
 */
const activeMapsetId: Ref<string|null> = ref(null)

/**
 * The id of the first of the available mapsets
 */
const firstMapsetId = computed<string|null>(() => {
  if (! hasAvailableMapsets.value) return null

  return availableMapsets.value[0].id
})

/**
 * If available we use the preferred default, otherwise go for the first mapset
 */
const defaultMapsetId = computed<string|null>(() => {

  const preferredMapsetId = import.meta.env.VITE_DEFAULT_MAPSET_ID || "c81d4c1b-cc11-4f80-b324-9ab7e6cefd99"

  if (getMapsetById(preferredMapsetId)) {
    return preferredMapsetId
  }

  return firstMapsetId.value
})

/**
 * Get a mapset by id
 */
const getMapsetById = function getMapsetById(id: string) {
  if (! hasAvailableMapsets.value) return null

  return availableMapsets.value.find( (group: IMapsetFE) => {
    return group.id === id
  }) || null
}

/**
 * Whether a specific mapset is available
 */
const isMapsetAvailable = function isMapsetAvailable(mapsetId: string) {
  return !! getMapsetById(mapsetId)
}

/**
 * Whether a specific mapset is available & public
 */
const isPublicMapset = function isPublicMapset(mapsetId: string) {
  return getMapsetById(mapsetId)?.public === true
}

/**
 * The active Map Group based on the active id
 */
const activeMapset = computed<IMapsetFE|null>(() => {
  if (activeMapsetId.value === null) return null
  return getMapsetById(activeMapsetId.value as string)
})

/**
 * Automatically unset the activeMapSetId if the active mapset is no longer available
 */ 
watch(() => activeMapset.value, (value) => {
  if (value === null && activeMapsetId.value !== null) {
    activeMapsetId.value = null

    // If there is still a (public) mapset available, make that the active mapset
    if (hasAvailableMapsets.value) {
      activeMapsetId.value = firstMapsetId.value
    }
  }
})



function useMapsets() {

  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)

  /**
   * Activate a Mapset by id
   */
  const selectMapsetById = function selectMapsetById(id: string) {

    // Nothing changes
    if (activeMapset.value?.id === id) return 

    // First check whether the group actually is available to the user and loaded
    const Mapset = availableMapsets.value.find( (group: IMapsetFE) => {
      return group.id === id
    }) || null

    if (Mapset) {
      activeMapsetId.value = id
    }
  }


  // TODO: Error handling ... 
  async function loadAvailableMapsets() {

    // This endpoint only works for authenticated users
    if (! isAuthenticated.value) return

    isLoadingMapsets.value = true

    const response = await api.mapset.getAvailableMapsets()
    if (response) {

      // Merge new (private) mapsets with public mapsets already present
      availableMapsets.value = availableMapsets.value
        .filter(mapset => mapset.public === true)
        .concat(response)

    } else {
      // TODO: Error handling 
      availableMapsets.value = []
    }
    


    isLoadingMapsets.value = false
  }

  /**
   * 
   */
  async function loadAvailableMapsetsById(mapsetId: string) {
    
    
    // TODO: Show different error from failure to load mapsets as logged in user.
    // TODO: Differentiate error between logged in users and guests - at component level.
    
    isLoadingMapsets.value = true

    try {
      const response = await api.mapset.getPublicAndAvailableMapsetsById(mapsetId)

      if (response) {
        // Merge the new mapsets with public mapsets already present
        availableMapsets.value = availableMapsets.value
          .filter(mapset => mapset.public === true)
          .concat(response)
      }

    } catch(err) {
      // We don't remove any already available mapsets if the request for a specific mapset by id failed. 
    }      
    
    isLoadingMapsets.value = false
  }

  /**
   * Clean up only the private mapsets
   *  Note: Not used bacause it creates an issue with logging in again from a public mapset after logging out
   */
  function removePrivateMapsets() {

    // No cleanup needed
    if (! hasAvailableMapsets.value) return

    // Only public mapsets may remain
    availableMapsets.value = availableMapsets.value
      .filter(mapset => {
        return mapset.public === true
      })
  }

  /**
   * Just remove it all. Private and public alike
   */
  function removeAllMapsets() {

    // No cleanup needed
    if (! hasAvailableMapsets.value) return

    availableMapsets.value = []
  }

  return {
    isLoadingMapsets,
    isLoadingMapsetsDebounced,
    loadAvailableMapsets,
    loadAvailableMapsetsById,
    selectMapsetById,
    availableMapsets,
    activeMapsetId,
    firstMapsetId,
    defaultMapsetId,
    getMapsetById,
    activeMapset,
    hasAvailableMapsets,
    hasAvailablePrivateMapsets,
    isMapsetAvailable,
    isPublicMapset,
    noMapsetsFound,
    requestedMapsetNotFound,
    removePrivateMapsets,
    removeAllMapsets
  }
}

export const useMapsetStore = defineStore(
  'Mapsets',
  useMapsets
)