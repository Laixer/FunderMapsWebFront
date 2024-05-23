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
      /**
       * The sessionStorage key used to store the id of the last viewed public mapset
       */
      const publicMapsetSessionKey = 'last-viewed-public-mapset'
      const privateMapsetSessionKey = 'last-viewd-private-mapset'

      /**
       * When opening the application without a specific mapset in mind, 
       *  check for the last viewed public mapset in the session storage
       *  TODO: check for the last viewed private mapset as 3rd option.
       */
      const mapsetId = route.params?.mapsetId 
        || sessionStorage.getItem(publicMapsetSessionKey)
        || sessionStorage.getItem(privateMapsetSessionKey)

      console.log("Mapset - MapsetId param changed", route.params?.mapsetId, mapsetId)


      /** 
       * Logged in, but no private mapsets available yet? Load all private mapsets before going any further
       **/ 
      if (isAuthenticated.value && ! hasAvailablePrivateMapsets.value) {
        console.log("Mapset - Loading private mapsets")
        await loadAvailableMapsets()
      }

      /** 
       * A mapset Id was set in the url
       */ 
      if (mapsetId) {

        // If not available yet, try to specifically load this mapset
        if (! isMapsetAvailable(mapsetId as string)) {
          console.log("Mapset - requested mapset is not yet available")

          await loadAvailableMapsetsById(mapsetId as string)
        }

        // If (now) available, mark it as the last visited mapset and select it
        if (isMapsetAvailable(mapsetId as string)) {
          console.log("Mapset - requested mapset is now available")

          if (isPublicMapset(mapsetId as string)) {
            console.log("Mapset - is public mapset")
            sessionStorage.setItem(publicMapsetSessionKey, mapsetId.toString())
          } else {
            console.log("Mapset - is private mapset")
            sessionStorage.setItem(privateMapsetSessionKey, mapsetId.toString())
          }

          selectMapsetById(mapsetId as string)

          return // Done

        } else {
          console.log("Mapset - unable to load requested mapset")
        }
      }

      /**
       * Unable to load the requested mapset and _not_ logged in?
       */
      if (! isAuthenticated.value) {
        console.log('Mapset - visitor is not logged in')

        // Try to redirect to the last visited public mapset, if not already the currently requested mapset
        if (sessionStorage.getItem(publicMapsetSessionKey) && mapsetId !== sessionStorage.getItem(publicMapsetSessionKey)) {
          console.log('Mapset - redirecting to last visited public mapset')
          navigateToMapset(sessionStorage.getItem(publicMapsetSessionKey))
        } else {
          console.log('Mapset - redirecting to login')

          // Otherwise back to start
          router.push({ name: 'login' })
        }

        return // Done
      } 

      // Unable to load the requested mapset and logged in? 

      /**
       * Logged in and no mapsets available at all... 
       */
      if (! hasAvailableMapsets.value) {

        // Perhaps there is a public mapset we can show?
        if (sessionStorage.getItem(publicMapsetSessionKey) && mapsetId !== sessionStorage.getItem(publicMapsetSessionKey)) {
          console.log('Mapset - no (private) mapsets available. Redirecting to last viewed public mapset')
          navigateToMapset(sessionStorage.getItem(publicMapsetSessionKey))
        } else {
          console.log('Mapset - no (private) mapsets available, an no known public mapset to redirect to')
        }
        return
      } else {

        if (mapsetId !== defaultMapsetId.value) {
          console.log('Mapset - redirecting to default mapset')
          navigateToMapset(defaultMapsetId.value)
        } else if (mapsetId !== firstMapsetId.value) {
          console.log('Mapset - redirecting to first available mapset')
          navigateToMapset(firstMapsetId.value)
        } else {
          console.log("Mapset - something is going wrong")
        }
      }
    }, 
    { immediate: true }
  )


  /**
   * If the activeMapsetId changed from another source than the route param, make the route match
   *  This triggers the associated logic of loading mapset data if necessary
   * 
   *  TODO: Include building route param
   */
  watch(() => activeMapsetId.value, (value) => {
    console.log("Mapset - Redirect to different mapset?", value)

    if (value && value !== route.params?.mapsetId) {
      console.log("Mapset - Yes")

      navigateToMapset(value)
    } else {
      console.log("Mapset - No")
    }
  })

  /**
   * Navigate to a mapset
   *  If we're viewing a building, change only the mapset param and redirect to the building
   * 
   * @returns 
   */
  function navigateToMapset(id: string|null) {

    // No mapset id => going home (which may redirect to login)
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