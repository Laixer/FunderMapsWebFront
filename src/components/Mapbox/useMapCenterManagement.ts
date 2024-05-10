import mapboxgl, { type Map } from "mapbox-gl"
import { storeToRefs } from "pinia"
import { nextTick, watch } from "vue"

import { useMainStore } from '@/store/main';

/**
 * TODO: Set LngLat in route query string
 * TODO: Use LngLat from route query string on page load (note potential conflict with LngLat from building id)
 */
export const useMapCenterManagement = function useMapCenterManagement() {

  const { mapCenterLatLon } = storeToRefs( useMainStore() )

  // Reference to the mapbox instance
  let mapInstance: Map|null = null

  // A flag we use to track when the watcher should ignore center changes
  let ignoreCenterChange: boolean = true

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
    handleMapMovement()
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