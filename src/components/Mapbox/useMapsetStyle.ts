import { type Map } from "mapbox-gl";
import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';

/**
 * Change the map style when the active mapset id changes
 */
export const useMapsetStyle = function useMapsetStyle() {
  const { activeMapset } = storeToRefs( useMapsetStore() )

  let mapInstance: Map|null = null

  watch(
    () => activeMapset.value, 
    (mapset) => {
      if (mapInstance !== null && mapset?.style) {
        mapInstance.setStyle(mapset.style)
      }
    }
  )

  /**
   * Attach the map instance
   *  Map is not yet available during setup & watcher needs to start during setup
   */
  const attachMap = function attachMap(map: Map) {
    mapInstance = map
  }

  const disconnect = function disconnect() {
    mapInstance = null
  }

  return {
    attachMap,
    disconnect
  }
}