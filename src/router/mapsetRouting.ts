import { watch } from "vue"
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from 'vue-router'

import { useMapsetStore } from '@/store/mapsets'
import { useSessionStore } from '@/store/session';


export const useMapsetRouting = function useMapsetRouting() {

  const router = useRouter()
  const route = useRoute()

  const mapsetStore = useMapsetStore()
  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)

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
    preferredMapsetId,
    activeMapsetId,
    firstMapsetId
  } = storeToRefs( mapsetStore )


  /**
   * Resolve which mapset to show for the current route.
   *  Load the mapset(s) if necessary. Waits for the session probe first:
   *  the cookie session is only known after /me has answered, and deciding
   *  on isAuthenticated before that treats every user as a guest (no private
   *  mapsets, "Geen kaarten gevonden", or a bounce to login).
   */
  async function resolveMapsetForRoute() {
    await sessionStore.ready

    const publicMapsetStorageKey = 'last-viewed-public-mapset'
    const privateMapsetStorageKey = 'last-viewed-private-mapset'

    const mapsetId = route.params?.mapsetId
      || localStorage.getItem(publicMapsetStorageKey)
      || localStorage.getItem(privateMapsetStorageKey)

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
          localStorage.setItem(publicMapsetStorageKey, mapsetId.toString())
        } else {
          localStorage.setItem(privateMapsetStorageKey, mapsetId.toString())
        }

        selectMapsetById(mapsetId as string)
        return
      }
    }

    // Unable to load the requested mapset and not logged in
    if (! isAuthenticated.value) {
      // Try to redirect to the last visited public mapset
      const lastPublic = localStorage.getItem(publicMapsetStorageKey)
      if (lastPublic && mapsetId !== lastPublic) {
        navigateToMapset(lastPublic)
      } else {
        router.push({ name: 'login' })
      }
      return
    }

    // Logged in and no mapsets available at all
    if (! hasAvailableMapsets.value) {
      const lastPublic = localStorage.getItem(publicMapsetStorageKey)
      if (lastPublic && mapsetId !== lastPublic) {
        navigateToMapset(lastPublic)
      }
      return
    }

    // Redirect to default or first available mapset
    if (mapsetId !== preferredMapsetId.value) {
      navigateToMapset(preferredMapsetId.value)
    } else if (mapsetId !== firstMapsetId.value) {
      navigateToMapset(firstMapsetId.value)
    }
  }

  /**
   * Handle changes in the mapsetId in the path
   */
  watch(() => route.params.mapsetId, resolveMapsetForRoute, { immediate: true })

  /**
   * A session that appears after the first resolve (login without a page
   * load) brings private mapsets with it.
   */
  watch(isAuthenticated, (value) => {
    if (value) resolveMapsetForRoute()
  })


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
