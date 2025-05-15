/**
 * TODO:
 *  - layer specs from API
 *  - API returns boolean 'hasBuildingEvents' prop per layer
 */

import { LayerSpecification, type Map } from "mapbox-gl";
import { type MaybeRef, watch, ref } from "vue";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { type IMapsetFE } from "@/datastructures/interfaces";

import { useLayerEvents } from './useLayerEvents'
import { useMapSources } from "./useMapSources";
import { useGeographyFilter } from "./useGeographyFilter";
import { useOwnershipFilter } from "./useOwnershipFilter";
import { useLayerVisibility } from "./useLayerVisibility";

export const useMapLayers = function useMapLayers(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs(useMapsetStore())

  const mapInstance = ref(Map)

  let currentMapset: IMapsetFE
  let currentLayerIds: string[] = []

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
    applyOwnershipFilterToLayerSpecification,
    applyOwnershipFilterToggle
  } = useOwnershipFilter()

  const {
    setLayerVisibilityForMapset
  } = useLayerVisibility(Map)


  // TODO: Get from API 
  const getLayerSpecificationById = async function getLayerSpecificationById(layerId: string) {
    const layer = (await import(`../../config/layers/${layerId}.json`)).default
    return JSON.parse(JSON.stringify(layer))
  }

  /**
   * Add layers
   */
  const addLayers = async function addLayers(mapset: IMapsetFE) {

    console.log("map layers - add layers", mapset.layerSet, mapset.layerSet.map(layer => layer.id))

    // Too eager
    if (!mapInstance.value) {
      return
    }

    // Update the current list of layer ids & mapset
    // Reverse the order of the layers, so that the top legend matches the top layer
    currentLayerIds = mapset.layerSet.map(layer => layer.id).reverse()
    currentMapset = currentMapset

    for (let layerId of currentLayerIds) {
      if (!mapInstance.value.getLayer(layerId)) {
        try {
          // Get the base layer specification
          const layerSpecification: LayerSpecification = await getLayerSpecificationById(layerId)

          if (layerSpecification.source) {
            addSource(layerSpecification.source)
          }

          // Add geo fencing to specification
          applyGeographyFilterToLayerSpecification(layerSpecification, currentMapset)

          // Add ownership fencing
          applyOwnershipFilterToLayerSpecification(layerSpecification)

          mapInstance.value.addLayer(layerSpecification, import.meta.env.VITE_FUNDERMAPS_NUMBER_LAYER || 'building-number-label-hover')

          attachEventHandlers(layerId)

        } catch (e) {
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
    if (!mapInstance.value) {
      return
    }

    for (let layerId of mapset.layerSet.map(layer => layer.id)) {
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

  /**
   * 
   */
  const updateLayerFilters = async function updateLayerFilters() {

    // Too eager
    if (!mapInstance.value) {
      return
    }

    for (let layerId of currentLayerIds) {

      // Only continue if the layer is available
      if (mapInstance.value.getLayer(layerId)) {
        try {
          // Get the base layer specification
          // TODO: Move to API
          const layerSpecification: LayerSpecification = await getLayerSpecificationById(layerId)

          // Add geo fencing to specification
          applyGeographyFilterToLayerSpecification(layerSpecification, currentMapset)

          // Add ownership fencing
          applyOwnershipFilterToLayerSpecification(layerSpecification)

          mapInstance.value.setFilter(layerId, layerSpecification.filter)

        } catch (e) {
          console.error(e)
        }
      }
    }
  }

  /**
   * When the ownerschip toggle is flipped we want to update the layer filters
   */
  watch(
    () => applyOwnershipFilterToggle.value,
    updateLayerFilters
  )

}