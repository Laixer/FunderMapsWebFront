import mapboxgl, { type Map } from "mapbox-gl"
import { storeToRefs } from "pinia"
import { ComputedRef, computed, nextTick, watch } from "vue"

import { useMainStore } from '@/store/main';
import { useBuildingStore } from '@/store/buildings';
import { useGeoLocationsStore } from '@/store/building/geolocations'

import { IGeoLocationData } from "@/datastructures/interfaces";

/**
 * TODO: Set LngLat in route query string
 * TODO: Use LngLat from route query string on page load (note potential conflict with LngLat from building id)
 */
export const useMapCenterManagement = function useMapCenterManagement() {

  const { mapCenterLatLon } = storeToRefs( useMainStore() )
  const { buildingId } = storeToRefs(useBuildingStore())
  const { getLocationDataByBuildingId } = useGeoLocationsStore()  


  // Reference to the mapbox instance
  let mapInstance: Map|null = null

  // A flag we use to track when the watcher should ignore center changes
  let ignoreCenterChange: boolean = false

  const locationData: ComputedRef<IGeoLocationData|null> = computed(() => {
    if (! buildingId.value) return null
    return getLocationDataByBuildingId(buildingId.value)
  })

  const flyToCenter = function flyToCenter(center: mapboxgl.LngLat) {
    if (! mapInstance) return

    // Set some zoom limits that make sense when flying
    let zoom = mapInstance.getZoom()
    if (zoom > 18) zoom = 18
    if (zoom < 16) zoom = 16

    mapInstance.flyTo({
      center,
      essential: true,
      zoom
    })
  }

  const flyToBuildingLocation = function flyToBuildingLocation(location: IGeoLocationData) {
    if (location.residence && mapInstance) {
      mapCenterLatLon.value = new mapboxgl.LngLat(
        location.residence.longitude, 
        location.residence.latitude
      )
    }
  }

  watch(
    () => locationData.value,
    (location: IGeoLocationData|null) => {
      if (location) {
        flyToBuildingLocation(location)
      }
    },
    { immediate: true }
  )


  /**
   * Fly to a location if the mapcenter value is changed
   */
  watch(
    () => mapCenterLatLon.value,
    (center: mapboxgl.LngLat|null) => {

      // We use `ignoreCenterChange` to ignore changes caused by `handleMapMovement`
      if (! mapInstance || center === null || ignoreCenterChange === true) {
        return
      }

      flyToCenter(center)
    }, 
    { immediate: true }
  )

  /**
   * When the map moves, update the known center position
   */
  const handleMapMovement = function handleMapMovement() {
    ignoreCenterChange = true
    mapCenterLatLon.value = mapInstance?.getCenter() || null

    // ignore center changes for this iteration
    nextTick(() => {
      ignoreCenterChange = false
    })
  }

  /**
   * Attach the map instance
   *  Map is not yet available during setup & watcher needs to start during setup
   */
  const attachMap = function attachMap(map: Map) {
    mapInstance = map

    mapInstance.on('moveend', handleMapMovement)
    
    if (locationData.value && locationData.value.residence) {
      flyToBuildingLocation(locationData.value)
    } else {
      handleMapMovement()
    }
  }

  const disconnect = function disconnect() {
    if (mapInstance) {
      mapInstance.off('moveend', handleMapMovement)
    }
    mapInstance = null
  }

  return {
    attachMap,
    disconnect
  }
}