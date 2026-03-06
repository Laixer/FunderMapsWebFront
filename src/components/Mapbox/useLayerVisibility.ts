import { type Map } from "mapbox-gl";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { useLayersStore } from "@/store/layers";

import { type IMapsetFE } from "@/datastructures/interfaces";
import { type MaybeRef, toRaw, watch, ref } from "vue";

export const useLayerVisibility = function useLayerVisibility(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs(useMapsetStore())
  const layersStore = useLayersStore()
  const { getVisibleLayersByMapsetId, changeLayerVisibility } = layersStore
  const { visibleLayersByMapsetId } = storeToRefs(layersStore)

  const mapInstance = ref(Map)

  /**
   * Layer id of currently shown layers
   *  We keep track of this locally to reduce the number of visibility changes applied to Mapbox
   */
  let currentlyVisibleLayers: string[] = []
  let currentlyHiddenLayers: string[] = []

  /**
   * Defaults for first initial load
   */
  const preferredDefaultMapsetId = (import.meta.env.VITE_DEFAULT_MAPSET_ID || "c81d4c1b-cc11-4f80-b324-9ab7e6cefd99")
  const preferredDefaultLayerIds = (import.meta.env.VITE_DEFAULT_LAYERS || 'foundation-type-cluster,foundation-type-established,foundation-type-indicative')

  /**
   * Reveal the specified layers (and hide all others we know about)
   */
  const applyVisibilityOfLayers = function applyVisibilityOfLayers(idsOfVisibleLayers: string[], allKnownLayerIds: string[]) {
    idsOfVisibleLayers.forEach(function (layerId) {
      if (mapInstance.value && mapInstance.value.getLayer(layerId)) {
        mapInstance.value.setLayoutProperty(layerId, 'visibility', 'visible')
      }
    })

    // Update the local lists
    currentlyVisibleLayers = idsOfVisibleLayers
    currentlyHiddenLayers = allKnownLayerIds.filter(layerId => !idsOfVisibleLayers.includes(layerId))

    // Not all layers are hidden by default
    currentlyHiddenLayers.forEach(layerId => {
      if (mapInstance.value && mapInstance.value.getLayer(layerId)) {
        mapInstance.value.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }

  /**
   * Reveal the first of the known layers
   */
  const revealFirstLayer = function revealFirstLayer(allKnownLayerIds: string[], id: string) {
    if (allKnownLayerIds.length === 0) return

    // This changes the visibility in the store. The map will react
    changeLayerVisibility(allKnownLayerIds[0], true, id)
  }

  /**
   * Whether the provided mapset id is the id of the preferred default mapset
   */
  const isDefaultMapset = function isDefaultMapset(id: string) {
    return id === preferredDefaultMapsetId
  }

  /**
   * Whether the mapset contains any of the preferred default layers
   */
  const mapsetHasPreferredDefaultLayer = function mapsetHasPreferredDefaultLayer(allKnownLayerIds: string[]) {
    return preferredDefaultLayerIds.split(',').some((id: string) => allKnownLayerIds.includes(id))
  }

  /**
   * Try to reveal the default layers.
   *  This may fail if the config is incorrect, or if the mapset layers have changed
   *  If so, the first known layer will be revealed.
   */
  const revealDefaultLayers = function revealDefaultLayers(allKnownLayerIds: string[], id: string) {
    try {
      const preferredLayerIds = preferredDefaultLayerIds
        .split(',')
        .filter((layerId: string) => allKnownLayerIds.includes(layerId))

      if (preferredLayerIds.length === 0) throw new Error('No known layers')

      // This changes the visibility in the store. The map will react
      preferredLayerIds.forEach((layerId: string) => {
        changeLayerVisibility(layerId, true, id)
      })

    } catch {
      // If it fails, go with the first known layer
      revealFirstLayer(allKnownLayerIds, id)
    }
  }

  /**
   * Reveal layers that were previously enabled (by referencing sessionStorage)
   *  If none were enabled, enable the first layer of the layerSet
   */
  const setLayerVisibilityForMapset = function setLayerVisibilityForMapset(
    mapset?: IMapsetFE | undefined
  ) {
    mapset = mapset || activeMapset.value || undefined

    if (!mapset) return

    // Reset the local trackers when the map style changes
    currentlyVisibleLayers = []
    currentlyHiddenLayers = []

    const allKnownLayerIds = mapset.layerSet.map(layer => layer.id)
    const visibleLayers = getVisibleLayersByMapsetId(mapset.id)

    if (visibleLayers.length !== 0) {
      applyVisibilityOfLayers(visibleLayers, allKnownLayerIds)
    } else {
      // Start by making sure all are hidden
      applyVisibilityOfLayers([], allKnownLayerIds)

      // Use preferred defaults if available, otherwise reveal the first layer
      if (isDefaultMapset(mapset.id) || mapsetHasPreferredDefaultLayer(allKnownLayerIds)) {
        revealDefaultLayers(allKnownLayerIds, mapset.id)
      } else {
        revealFirstLayer(allKnownLayerIds, mapset.id)
      }
    }
  }

  /**
   * Watch for changes in the visible layers of the active mapset
   */
  watch(
    () => visibleLayersByMapsetId.value,
    () => {
      if (!activeMapset.value) return

      const visibleLayers = toRaw(
        getVisibleLayersByMapsetId(activeMapset.value.id)
      )

      const newlyHidden = currentlyVisibleLayers.filter(layerId => !visibleLayers.includes(layerId))
      const newlyVisible = visibleLayers.filter(layerId => !currentlyVisibleLayers.includes(layerId))

      newlyVisible.forEach(layerId => {
        if (mapInstance.value?.getLayer(layerId)) {
          mapInstance.value.setLayoutProperty(layerId, 'visibility', 'visible')
        }
      })

      newlyHidden.forEach(layerId => {
        if (mapInstance.value?.getLayer(layerId)) {
          mapInstance.value.setLayoutProperty(layerId, 'visibility', 'none')
        }
      })

      // Update the local trackers
      currentlyVisibleLayers = visibleLayers
      currentlyHiddenLayers = currentlyHiddenLayers
        .filter(layerId => !visibleLayers.includes(layerId))
        .concat(newlyHidden)
    },
    { deep: true, immediate: true }
  )

  return {
    setLayerVisibilityForMapset
  }
}

