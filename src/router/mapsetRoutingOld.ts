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
    activeMapsetId 
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
      // const privateMapsetSessionKey = 'last-viewd-private-mapset'

      /**
       * When opening the application without a specific mapset in mind, 
       *  check for the last viewed public mapset in the session storage
       *  TODO: check for the last viewed private mapset as 3rd option.
       */
      const mapsetId = route.params?.mapsetId 
        || sessionStorage.getItem(publicMapsetSessionKey)

      console.log("Mapset - MapsetId param changed", mapsetId)

      /**
       * A specific (perhaps public) mapset is requested
       */ 
      if (mapsetId) {

        // Avoid loading a mapset twice
        if (! isMapsetAvailable(mapsetId as string)) {
          console.log("Mapset - is not available")

          // Note: This used to load all other available mapsets for a logged in user. This has changed.
          // TODO: This generates a failed API call for logged in users that have not yet loaded any mapsets
          // TODO:  This failed call is handled further on, but perhaps it could be avoided, without 
          // TODO:  negating the option to load public mapsets for logged in users by opening an url
          await loadAvailableMapsetsById(mapsetId as string)
          
          // For users that are authenticated, also get their private mapsets
          // TODO: Sort public mapsets in a "public" org
          if (isAuthenticated.value && isPublicMapset(mapsetId as string)) {
            await loadAvailableMapsets()
          }
        }

        // If the mapset is (now) available and public, store the id as last viewed public mapset
        if (isPublicMapset(mapsetId as string)) {
          console.log("Main - is public mapset")
          sessionStorage.setItem(publicMapsetSessionKey, mapsetId.toString())
        }

        // All went well, time to show the requested mapset
        if (isMapsetAvailable(mapsetId as string)) {
          console.log("Main - is available")
          selectMapsetById(mapsetId as string)
          return
        } else {
          console.log("Main - mapset still not available")
          console.log(mapsetId)
        }
      }

      /**
       * Not logged in and not requesting a specific public mapset,
       *  or is the requested mapset not public?
       * => redirect to login
       */
      if (! isAuthenticated.value) {
        console.log("Main - user not logged in")
        router.push({ name: 'login' })
        return
      }

      /**
       * Beyond this point we're dealing with a logged in user
       */

      // Load the available mapsets, if this has not been done yet
      if (! hasAvailablePrivateMapsets.value) {
        console.log("Main - no mapsets available yet")
        await loadAvailableMapsets()
      }

      // Aparently the user has no access to any mapsets
      // A modal will be shown to the user if this is the case
      if (! hasAvailableMapsets.value) {
        console.log("Main - Failed to load any mapsets")
        return
      }

      // The requested mapset was one of the private mapsets available to the user
      // Note: private mapsets cannot be requested through the endpoint to retrieve public + available private mapsets
      if (mapsetId && isMapsetAvailable(mapsetId as string)) {
        console.log("Main - requested mapset is now available")
        selectMapsetById(mapsetId as string)
        return 
      }

      console.log("Main - redirecting to first available mapset")
      // TODO: Maybe skip loading loadAvailableMapsetsById first for authenticated users and fall back to it here? 
      
      // If no mapset was requested, or the mapset was not available,
      //  redirect the user to the first mapset from the list of available mapsets
      navigateToMapset(defaultMapsetId.value)
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
    console.log("Main - Redirect to different mapset?", value)

    if (value && value !== route.params?.mapsetId) {
      console.log("Main - Yes")

      navigateToMapset(value)
    } else {
      console.log("Main - No")
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