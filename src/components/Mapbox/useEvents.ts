
/***********************************************************************************
 * Map Event handling
 **********************************************************************************/

import { type Map } from "mapbox-gl";
import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { useBuildingRouting } from '@/router/buildingRouting'
import { IMapsetFE } from "@/datastructures/interfaces";
import { useSessionStore } from "@/store/session";

export const useEvents = function useEvents() {

  const { activeMapset } = storeToRefs( useMapsetStore() )
  const buildingRouting = useBuildingRouting()

  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)

  let mapInstance: Map|null = null

  /****************************************************************************
   * Event handlers
   */

  const mouseEnter = function mouseEnter() {
    mapInstance && (mapInstance.getCanvas().style.cursor = "pointer")
  }
  const mouseLeave = function mouseLeave() {
    mapInstance && (mapInstance.getCanvas().style.cursor = "")
  }

  /**
   * Navigate to building on click
   */
  const handleBuildingClick = async function handleBuildingClick(e: any) {
    if (e.features.length === 0) return 

    const props = e.features[0].properties

    const building_id = props?.building_id || props?.external_id || props?.id || null
    if (! building_id) {
      console.log("No known building id available on clicked feature")
      return
    }

    // Select the building by navigating to it
    buildingRouting.navigateToBuilding(building_id)
  }

  /****************************************************************************
   * Event handler management
   */

  /**
   * Remove the event handlers from the layers of the specified mapset
   */
  const removeEventHandlers = function removeEventHandlers(mapset: IMapsetFE) {
    if (! mapset) return 

    mapset.layerSet
      .map(layer => layer.id)
      .forEach(layerId => {
        if (! mapInstance) return
        
        mapInstance.off("mouseenter", layerId, mouseEnter)
        mapInstance.off("mouseleave", layerId, mouseLeave)
        mapInstance.off("click", layerId, handleBuildingClick)
      })
  }

  /**
   * Attach the event handlers to the layers of the active mapset
   */
  const attachEventHandlers = function attachEventHandlers() {

    // Only attach events for authenticated users
    if (! isAuthenticated.value) return 

    // No mapset to work with
    if (! activeMapset.value) return

    activeMapset.value.layerSet
      .map(layer => layer.id)
      .forEach(layerId => {
        if (! mapInstance) return
        
        mapInstance.on("mouseenter", layerId, mouseEnter)
        mapInstance.on("mouseleave", layerId, mouseLeave)
        mapInstance.on("click", layerId, handleBuildingClick)
      }) 
  }


  /**
   * Clean up whenever the active mapset changes
   */
  watch(
    () => activeMapset.value, 
    (_, oldMapset) => {
      if (mapInstance !== null && oldMapset) {
        removeEventHandlers(oldMapset)
      }
    }
  )

  /**
   * Attach or remove event handlers if auth state changes
   */
  watch(
    () => isAuthenticated.value,
    (authenticated) => {
      if (authenticated) {
        attachEventHandlers()
      } else if (activeMapset.value) {
        removeEventHandlers(activeMapset.value)
      }
    }
  )


  /****************************************************************************
   * connect / disconnect composable
   */

  /**
   * Attach the map instance
   *  Map is not yet available during setup & watcher needs to start during setup
   */
  const attachMap = function attachMap(map: Map) {
    mapInstance = map
    mapInstance.on('style.load', attachEventHandlers)

    // Attach event handlers to initial style
    attachEventHandlers()
  }

  const disconnect = function disconnect() {
    if (mapInstance) {
      mapInstance.off('style.load', attachEventHandlers)
    }
    mapInstance = null
  }

  return {
    attachMap,
    disconnect
  }
}