
/***********************************************************************************
 * Map Event handling
 **********************************************************************************/

import { type Map, type MapMouseEvent, type MapboxGeoJSONFeature } from "mapbox-gl";
import { type MaybeRef, shallowRef } from "vue";
import { storeToRefs } from "pinia";

import { useBuildingRouting } from '@/router/buildingRouting'
import { useSessionStore } from "@/store/session";
import { useMainStore } from "@/store/main";

export const useLayerEvents = function useLayerEvents(
  Map: MaybeRef<Map | null | undefined>
) {

  const buildingRouting = useBuildingRouting()

  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)
  const { mapMarkerLatLon, mapCenterLatLon } = storeToRefs(useMainStore())

  const mapInstance = shallowRef(Map)

  /****************************************************************************
   * Event handlers
   */

  const mouseEnter = function mouseEnter() {
    if (isAuthenticated.value && mapInstance.value) {
      mapInstance.value.getCanvas().style.cursor = "pointer"
    }
  }
  const mouseLeave = function mouseLeave() {
    if (mapInstance.value) {
      mapInstance.value.getCanvas().style.cursor = ""
    }
  }

  /**
   * Navigate to building on click
   */
  const handleBuildingClick = async function handleBuildingClick(e: MapMouseEvent & { features?: MapboxGeoJSONFeature[] }) {
    if (!e.features || e.features.length === 0) return

    // Map interaction is only for authenticated users
    if (! isAuthenticated.value) return

    const props = e.features[0].properties || {}

    // Be flexible about the prop containing the building id
    const building_id = props?.building_id || props?.external_id || props?.id || null
    if (! building_id) {
      console.warn("No known building id available on clicked feature")
      return
    }

    // Drop a marker and pan to the click position. The geocoder API doesn't
    // return building coordinates, so the click is the only source of truth.
    mapMarkerLatLon.value = e.lngLat
    mapCenterLatLon.value = e.lngLat

    buildingRouting.navigateToBuilding(building_id)
  }

  /****************************************************************************
   * Event handler management
   */

  /**
   * Remove the event handlers from the layers of the specified mapset
   */
  const removeEventHandlers = function removeEventHandlers(layerId: string) {
    
    // No map instance to work with
    if (! mapInstance.value) return
    if (! mapInstance.value.getLayer(layerId)) {
      return
    }
    
    mapInstance.value.off("mouseenter", layerId, mouseEnter)
    mapInstance.value.off("mouseleave", layerId, mouseLeave)
    mapInstance.value.off("click", layerId, handleBuildingClick)
  }

  /**
   * Attach the event handlers to the layers of the active mapset
   */
  const attachEventHandlers = function attachEventHandlers(layerId: string) {

    // No map instance to work with
    if (! mapInstance.value) return
    if (! mapInstance.value.getLayer(layerId)) return

    mapInstance.value.on("mouseenter", layerId, mouseEnter)
    mapInstance.value.on("mouseleave", layerId, mouseLeave)
    mapInstance.value.on("click", layerId, handleBuildingClick)
  }


  return {
    attachEventHandlers,
    removeEventHandlers
  }
}