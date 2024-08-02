import { watch } from "vue"
import { storeToRefs } from "pinia"
import { useMainStore } from "@/store/main"
import { useSessionStore } from "@/store/session"
import { useRoute, useRouter } from 'vue-router'
import mapboxgl from "mapbox-gl"


export const useMapCenterRouting = function useMapCenterRouting() {

  const router = useRouter()
  const route = useRoute()
  
  const { isAuthenticated } = storeToRefs( 
    useSessionStore() 
  )

  const { mapCenterLatLon } = storeToRefs(
    useMainStore()
  )

  watch(
    () => mapCenterLatLon.value,
    (LatLng) => {
      if (! isAuthenticated.value) return 

      if (LatLng && LatLng.lat && LatLng.lng && !! route.name) {

        let query = route.query || {}

        query.lat = `${LatLng.lat.toFixed(5)}`
        query.lng = `${LatLng.lng.toFixed(5)}` 

        router.push({
          name: route.name,
          params: route.params,
          query,
          force: true
        })
      }
    }
  )
  
  const hasLatLngInQueryString = function hasLatLngInQueryString() {
    return route.query.lat && route.query.lng
  }

  const getLatLngFromQueryString = function getLatLngFromQueryString() {
    try {
      if (hasLatLngInQueryString()) {
        return new mapboxgl.LngLat(
          parseFloat(`${route.query.lng}`), 
          parseFloat(`${route.query.lat}`)
        )
      }
    } catch(e) {
      return null
    }
  }

  return {
    hasLatLngInQueryString,
    getLatLngFromQueryString
  }
}