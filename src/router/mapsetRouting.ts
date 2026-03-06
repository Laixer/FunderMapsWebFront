import { watch } from "vue"
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from 'vue-router'

import { useMapsetStore } from '@/store/mapsets'
import { useSessionStore } from '@/store/session';


export const useMapsetRouting = function useMapsetRouting() {

  const router = useRouter()
  const route = useRoute()

  const mapsetStore = useMapsetStore()
  const { isAuthenticated } = storeToRefs(
    useSessionStore()
  )

  const {
    loadAvailableMapsets,
    loadAvailableMapsetsById,
    isMapsetAvailable,
    isPublicMapset,
    selectMapsetById
  } = mapsetStore

  const {
    hasAvailableMapsets,
    hasAvailablePrivateMapsets,
    defaultMapsetId,
    activeMapsetId,
    firstMapsetId
  } = storeToRefs( mapsetStore )


  /**
   * Handle changes in the mapsetId in the path
   *  Load the mapset(s) if necessary
   */
  watch(
    () => route.params.mapsetId,
    async () => {
      const publicMapsetSessionKey = 'last-viewed-public-mapset'
      const privateMapsetSessionKey = 'last-viewed-private-mapset'

      const mapsetId = route.params?.mapsetId
        || sessionStorage.getItem(publicMapsetSessionKey)
        || sessionStorage.getItem(privateMapsetSessionKey)

      // Logged in, but no private mapsets available yet? Load them first
      if (isAuthenticated.value && ! hasAvailablePrivateMapsets.value) {
        await loadAvailableMapsets()
      }

      // A mapset Id was set in the url
      if (mapsetId) {

        // If not available yet, try to specifically load this mapset
        if (! isMapsetAvailable(mapsetId as string)) {
          await loadAvailableMapsetsById(mapsetId as string)
        }

        // If (now) available, mark it as the last visited mapset and select it
        if (isMapsetAvailable(mapsetId as string)) {
          if (isPublicMapset(mapsetId as string)) {
            sessionStorage.setItem(publicMapsetSessionKey, mapsetId.toString())
          } else {
            sessionStorage.setItem(privateMapsetSessionKey, mapsetId.toString())
          }

          selectMapsetById(mapsetId as string)
          return
        }
      }

      // Unable to load the requested mapset and not logged in
      if (! isAuthenticated.value) {
        // Try to redirect to the last visited public mapset
        const lastPublic = sessionStorage.getItem(publicMapsetSessionKey)
        if (lastPublic && mapsetId !== lastPublic) {
          navigateToMapset(lastPublic)
        } else {
          router.push({ name: 'login' })
        }
        return
      }

      // Logged in and no mapsets available at all
      if (! hasAvailableMapsets.value) {
        const lastPublic = sessionStorage.getItem(publicMapsetSessionKey)
        if (lastPublic && mapsetId !== lastPublic) {
          navigateToMapset(lastPublic)
        }
        return
      }

      // Redirect to default or first available mapset
      if (mapsetId !== defaultMapsetId.value) {
        navigateToMapset(defaultMapsetId.value)
      } else if (mapsetId !== firstMapsetId.value) {
        navigateToMapset(firstMapsetId.value)
      }
    },
    { immediate: true }
  )


  /**
   * If the activeMapsetId changed from another source than the route param, make the route match
   */
  watch(() => activeMapsetId.value, (value) => {
    if (value && value !== route.params?.mapsetId) {
      navigateToMapset(value)
    }
  })

  /**
   * Navigate to a mapset
   *  If we're viewing a building, change only the mapset param and redirect to the building
   */
  function navigateToMapset(id: string|null) {
    if (! id) {
      router.push({ name: 'home' })
      return
    }
    let name = route.name

    let params = {
      mapsetId: id
    }

    if (name && ['building', 'building-panel'].includes(name as string)) {
      params = Object.assign(params, {
        buildingId: route.params.buildingId,
        panel: route.params.panel || null
      })
    } else {
      name = 'mapset'
    }

    router.push({ name, params, query: route.query })
  }


  return {
    navigateToMapset
  }
}
