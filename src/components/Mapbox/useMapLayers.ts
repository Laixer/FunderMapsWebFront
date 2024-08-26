/**
 * 
 * TODO:
 *  - layer specs from API
 *  - API returns boolean 'hasBuildingEvents' prop per layer
 * 
 */

import { LayerSpecification, type Map } from "mapbox-gl";
import { type MaybeRef, watch, ref } from "vue";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { type IMapsetFE } from "@/datastructures/interfaces";

import { useLayerEvents } from './useLayerEvents'
import { useMapSources } from "./useMapSources";
import { useGeographyFilter } from "./useGeographyFilter";
import { useLayerVisibility } from "./useLayerVisibility";

export const useMapLayers = function useMapLayers(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const mapInstance = ref(Map)

  const {
    attachEventHandlers,
    removeEventHandlers
  } = useLayerEvents(Map)

  const {
    addSource
  } = useMapSources(Map)

  const {
    applyGeographyFilterToLayerSpecification
  } = useGeographyFilter()

  const {
    setLayerVisibilityForMapset
  } = useLayerVisibility(Map)

  /**
   * Add layers
   */
  const addLayers = async function addLayers(mapset: IMapsetFE) {

    console.log("map layers - add layers", mapset.layerSet, mapset.layerSet.map(layer => layer.id))

    // Too eager
    if (! mapInstance.value) {
      return
    }
    
    for(let layerId of mapset.layerSet.map(layer => layer.id)) {
      if (! mapInstance.value.getLayer(layerId)) {
        
        try {
          // Get the layer specification
          // TODO: Move to API
          const layerSpecification: LayerSpecification = (await import(`../../config/layers/${layerId}.json`)).default
          console.log(layerId, layerSpecification)

          if (layerSpecification.source) {
            addSource(layerSpecification.source)
          }

          // Add geo fencing to specification
          applyGeographyFilterToLayerSpecification(layerSpecification, mapset)

          mapInstance.value.addLayer(layerSpecification)

          attachEventHandlers(layerId)

        } catch(e) {
          console.error(e)
        }
      }
    }

    // TODO: Set visibility according to store state as part of the layerSpefication creation
    setLayerVisibilityForMapset(mapset)
  }

  /**
   * Remove layers of a particular mapset
   */
  const removeLayers = function removeLayers(mapset: IMapsetFE) {

    // Too late ?
    if (! mapInstance.value) {
      return
    }

    for(let layerId of mapset.layerSet.map(layer => layer.id)) {
      if (mapInstance.value.getLayer(layerId)) {
        removeEventHandlers(layerId)
        mapInstance.value.removeLayer(layerId)
      }
    }
  }


  /**
   * When the active mapset changes we remove the layers of the previous mapset, and add the layers of the new mapset
   */
  watch(
    () => activeMapset.value, 
    (activeMapset, oldMapset) => {
      if (oldMapset) {
        removeLayers(oldMapset)
      }
      if (activeMapset) {
        addLayers(activeMapset)
      }
    },
    { immediate: true }
  )


  /**
   * When the map instantiates we add the layers for the first time
   */
  watch(
    () => mapInstance.value,
    () => activeMapset.value && addLayers(activeMapset.value), 
    { once: true }
  )
}