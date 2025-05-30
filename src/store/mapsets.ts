import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'
import { refDebounced } from '@vueuse/core'

import { type IMapsetFE } from '@/datastructures/interfaces';

import api from '@/services/api'
import { computed } from '@vue/reactivity';

import { useSessionStore } from '@/store/session'

/**
 * Helper function to enforce geo fencing on public mapsets
 */
const enforceGeoFencingOnPublicMapsets = function enforceGeoFencingOnPublicMapsets(mapset: IMapsetFE) {
  if (mapset.slug === 'schiedam-publiek') {
    mapset.fenceMunicipality = ['GM0606']
  }
  if (mapset.slug === 'woerden-publiek') {
    mapset.fenceMunicipality = ['GM0632']
  }

  return mapset
}

/**
 * The map groups available to the user
 */
const availableMapsetsById: Ref<Record<string, IMapsetFE>> = ref({})

const mapsetIdsBySlug = computed(() => {
  return Object.values(availableMapsetsById.value)
    .reduce((acc: Record<string, string>, mapset: IMapsetFE) => {
      acc[mapset.slug] = mapset.id
      return acc
    }, {})
})

const availableMapsetsByLoadingOrder = computed(() => {
  return Object.values(availableMapsetsById.value)
    .sort((a, b) => {
      // Public mapsets always go first
      if (a.public) {
        return b.public ? a.loadedAt - b.loadedAt : -1
      } else if (b.public) {
        return 1
      }

      return a.loadedAt - b.loadedAt
    })
})

/**
 * The ids and slugs of the available mapsets
 */
const availableMapsetIds = computed(() => Object.keys(availableMapsetsById.value))
const availableMapsetSlugs = computed(() => Object.values(availableMapsetsById.value).map(mapset => mapset.slug))

/**
 * Used to indicate whether map groups are loaded
 */
const hasAvailableMapsets = computed<boolean>(() => {
  return Object.keys(availableMapsetsById.value).length !== 0
})

/**
 * Has mapsets available, and at least is not public
 */
const hasAvailablePrivateMapsets = computed<boolean>(() => {
  return hasAvailableMapsets.value
    && Object.values(availableMapsetsById.value).some(mapset => mapset.public !== true)
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
const activeMapsetId: Ref<string | null> = ref(null)

/**
 * The id of the first of the available mapsets
 */
const firstMapsetId = computed<string | null>(() => {
  if (!hasAvailableMapsets.value) return null

  return availableMapsetsByLoadingOrder.value[0].id
})

/**
 * If available we use the preferred default, otherwise go for the first mapset
 */
const defaultMapsetId = computed<string | null>(() => {

  const preferredMapsetId = import.meta.env.VITE_DEFAULT_MAPSET_ID || "c81d4c1b-cc11-4f80-b324-9ab7e6cefd99"

  if (getMapsetByIdentifier(preferredMapsetId)) {
    return preferredMapsetId
  }

  return firstMapsetId.value
})

/**
 * Get a mapset by id
 */
const getMapsetById = function getMapsetById(id: string) {
  if (!hasAvailableMapsets.value) return null

  return availableMapsetsById.value[id] || null
}

const getMapsetBySlug = function getMapsetBySlug(slug: string) {
  const id = mapsetIdsBySlug.value[slug]
  return getMapsetById(id)
}

/**
 * Accept either id or slug
 */
const getMapsetByIdentifier = function getMapsetByIdentifier(identifier: string) {
  return getMapsetById(identifier) || getMapsetBySlug(identifier)
}

/**
 * 
 */
const getMapsetIdByIdentifier = function getMapsetByIdentifier(identifier: string) {
  const mapset = getMapsetById(identifier) || getMapsetBySlug(identifier)
  return mapset?.id || undefined
}

/**
 * Whether a specific mapset is available
 */
const isMapsetAvailable = function isMapsetAvailable(mapsetId: string) {
  return !!getMapsetByIdentifier(mapsetId)
}

/**
 * Whether a specific mapset is available & public
 */
const isPublicMapset = function isPublicMapset(mapsetId: string) {
  return getMapsetByIdentifier(mapsetId)?.public === true
}

/**
 * The active Map Group based on the active id
 */
const activeMapset = computed<IMapsetFE | null>(() => {
  if (activeMapsetId.value === null) return null
  return getMapsetByIdentifier(activeMapsetId.value as string)
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
    const Mapset = getMapsetByIdentifier(id)

    if (Mapset) {
      activeMapsetId.value = id
    }
  }


  // TODO: Error handling ... 
  async function loadAvailableMapsets() {

    // This endpoint only works for authenticated users
    if (!isAuthenticated.value) return

    isLoadingMapsets.value = true

    const response = await api.mapset.getAvailableMapsets()
    if (response) {

      // Merge new (private) mapsets with public mapsets already present
      removePrivateMapsets()
      response.forEach((mapset: IMapsetFE) => {
        mapset = enforceGeoFencingOnPublicMapsets(mapset)
        availableMapsetsById.value[mapset.id] = mapset
      })

    } else {
      // TODO: Error handling 
      removePrivateMapsets()
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
        // Merge the new mapsets with the mapsets already present
        response.forEach((mapset: IMapsetFE) => {
          mapset = enforceGeoFencingOnPublicMapsets(mapset)
          availableMapsetsById.value[mapset.id] = mapset
        })
      }

    } catch (err) {
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
    if (!hasAvailableMapsets.value) return

    // Only public mapsets may remain
    Object.values(availableMapsetsById.value)
      .forEach((mapset: IMapsetFE) => {
        if (!mapset.public) {
          delete availableMapsetsById.value[mapset.id]
        }
      })
  }

  /**
   * Just remove it all. Private and public alike
   */
  function removeAllMapsets() {

    // No cleanup needed
    if (!hasAvailableMapsets.value) return

    // availableMapsets.value = []
    availableMapsetsById.value = {}
  }

  return {
    isLoadingMapsets,
    isLoadingMapsetsDebounced,
    loadAvailableMapsets,
    loadAvailableMapsetsById,
    selectMapsetById,
    availableMapsetsByLoadingOrder,
    availableMapsetIds,
    availableMapsetSlugs,
    activeMapsetId,
    firstMapsetId,
    defaultMapsetId,
    getMapsetById,
    getMapsetBySlug,
    getMapsetByIdentifier,
    getMapsetIdByIdentifier,
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