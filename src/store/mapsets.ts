import { type Ref, ref, watch, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia'
import { refDebounced } from '@vueuse/core'

import { type IMapsetFE } from '@/datastructures/interfaces';

import api from '@/services/api'
import { defaultMapsetId } from '@/config'

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


function useMapsets() {

  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)

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
   * Used to indicate whether map groups are loaded
   */
  const hasAvailableMapsets = computed<boolean>(() => {
    return Object.keys(availableMapsetsById.value).length !== 0
  })

  /**
   * Has mapsets available, and at least one is not public
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
    return isLoadingMapsets.value === false
      && hasAvailableMapsets.value === false
      && isAuthenticated.value
  })

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
  const preferredMapsetId = computed<string | null>(() => {
    if (getMapsetByIdentifier(defaultMapsetId)) {
      return defaultMapsetId
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

  const getMapsetIdByIdentifier = function getMapsetIdByIdentifier(identifier: string) {
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

  /**
   * Activate a Mapset by id
   */
  const selectMapsetById = function selectMapsetById(id: string) {
    if (activeMapset.value?.id === id) return

    const mapset = getMapsetByIdentifier(id)
    if (mapset) {
      activeMapsetId.value = id
    }
  }

  async function loadAvailableMapsets() {
    if (!isAuthenticated.value) return

    isLoadingMapsets.value = true

    try {
      const response = await api.mapset.getAvailableMapsets()
      removePrivateMapsets()
      response.forEach((mapset: IMapsetFE) => {
        mapset = enforceGeoFencingOnPublicMapsets(mapset)
        availableMapsetsById.value[mapset.id] = mapset
      })
    } catch (e) {
      console.error('Failed to load available mapsets', e)
      removePrivateMapsets()
    }

    isLoadingMapsets.value = false
  }

  async function loadAvailableMapsetsById(mapsetId: string) {
    isLoadingMapsets.value = true

    try {
      const response = await api.mapset.getPublicAndAvailableMapsetsById(mapsetId)
      response.forEach((mapset: IMapsetFE) => {
        mapset = enforceGeoFencingOnPublicMapsets(mapset)
        availableMapsetsById.value[mapset.id] = mapset
      })
    } catch (e) {
      console.error('Failed to load mapset by id:', mapsetId, e)
    }

    isLoadingMapsets.value = false
  }

  /**
   * Clean up only the private mapsets
   */
  function removePrivateMapsets() {
    if (!hasAvailableMapsets.value) return

    Object.values(availableMapsetsById.value)
      .forEach((mapset: IMapsetFE) => {
        if (!mapset.public) {
          delete availableMapsetsById.value[mapset.id]
        }
      })
  }

  /**
   * Remove all mapsets
   */
  function removeAllMapsets() {
    if (!hasAvailableMapsets.value) return
    availableMapsetsById.value = {}
  }

  return {
    isLoadingMapsets,
    isLoadingMapsetsDebounced,
    loadAvailableMapsets,
    loadAvailableMapsetsById,
    selectMapsetById,
    availableMapsetsByLoadingOrder,
    activeMapsetId,
    firstMapsetId,
    preferredMapsetId,
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
    removePrivateMapsets,
    removeAllMapsets
  }
}

export const useMapsetStore = defineStore(
  'Mapsets',
  useMapsets
)
