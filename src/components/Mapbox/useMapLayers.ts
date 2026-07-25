/**
 * TODO:
 *  - layer specs from API
 *  - API returns boolean 'hasBuildingEvents' prop per layer
 */

import { type LayerSpecification, type Map } from "maplibre-gl";

// Our layer configs (config/layers/*.json) are always data layers, never
// background — background layers lack filter/source, which the plain
// LayerSpecification union would otherwise forbid accessing.
type DataLayerSpecification = Exclude<LayerSpecification, { type: 'background' }>
import { type MaybeRef, watch, shallowRef } from "vue";
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

  const mapInstance = shallowRef(Map)

  let currentMapset: IMapsetFE | null = null
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
    if (!mapInstance.value) return

    // Update the current list of layer ids & mapset
    // Reverse the order of the layers, so that the top legend matches the top layer
    currentLayerIds = mapset.layerSet.map(layer => layer.id).reverse()
    currentMapset = mapset

    for (const layerId of currentLayerIds) {
      if (!mapInstance.value.getLayer(layerId)) {
        try {
          // Get the base layer specification
          const layerSpecification: DataLayerSpecification = await getLayerSpecificationById(layerId)

          if (layerSpecification.source) {
            addSource(layerSpecification.source)
          }

          // Re-check after async import — another composable may have added it
          if (mapInstance.value.getLayer(layerId)) continue

          // Add geo fencing to specification
          applyGeographyFilterToLayerSpecification(layerSpecification, currentMapset)

          // Add ownership fencing
          applyOwnershipFilterToLayerSpecification(layerSpecification)

          // Insert data layers below the purple admin-boundary lines (and
          // thus below all labels). The anchor is resolved against the
          // running style: the env override first, then the boundary
          // layer, then the first symbol layer, then simply on top -
          // a missing anchor id must never take the whole mapset down
          // (the legacy hardcoded 'building-number-label-hover' anchor
          // did exactly that after the basemap swap).
          const anchorCandidates = [
            import.meta.env.VITE_FUNDERMAPS_NUMBER_LAYER,
            'fundermaps-municipality',
          ].filter(Boolean) as string[]
          const anchor = anchorCandidates.find((id) => mapInstance.value?.getLayer(id))
            || mapInstance.value.getStyle().layers.find((l) => l.type === 'symbol')?.id
          mapInstance.value.addLayer(layerSpecification, anchor)

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
    if (!mapInstance.value) return

    for (const layerId of mapset.layerSet.map(layer => layer.id)) {
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
   * Update the filters on all current layers (e.g. when ownership filter changes)
   */
  const updateLayerFilters = async function updateLayerFilters() {
    if (!mapInstance.value || !currentMapset) return

    for (const layerId of currentLayerIds) {
      if (!mapInstance.value.getLayer(layerId)) continue

      try {
        const layerSpecification: DataLayerSpecification = await getLayerSpecificationById(layerId)

        applyGeographyFilterToLayerSpecification(layerSpecification, currentMapset)
        applyOwnershipFilterToLayerSpecification(layerSpecification)

        mapInstance.value.setFilter(layerId, layerSpecification.filter)
      } catch (e) {
        console.error(e)
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