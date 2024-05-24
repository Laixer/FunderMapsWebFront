import { type Map } from "mapbox-gl";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { useLayersStore } from "@/store/layers";

import { type IMapsetFE } from "@/datastructures/interfaces";
import { toRaw, watch } from "vue";



export const useLayerVisibility = function useLayerVisibility() {

  const { activeMapset } = storeToRefs( useMapsetStore() )
  const { getVisibleLayersByMapsetId, changeLayerVisibility } = useLayersStore()
  const { visibleLayersByMapsetId } = storeToRefs(useLayersStore())

  let mapInstance: Map|null = null

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
  const preferredDefaultLayerIds = (import.meta.env.VITE_DEFAULT_LAYERS || 'foundation-type-cluster,foundation-type-established') 

  /**
   * Reveal the specified layers (and hide all others we know about)
   */
  const applyVisibilityOfLayers = function applyVisibilityOfLayers( idsOfVisibleLayers: string[], allKnownLayerIds: string[] ) {

    console.log(mapInstance, idsOfVisibleLayers)

    idsOfVisibleLayers.forEach(function (layerId) {
      mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'visible')
    })

    // Update the local lists
    currentlyVisibleLayers = idsOfVisibleLayers
    currentlyHiddenLayers = allKnownLayerIds.filter(layerId => ! idsOfVisibleLayers.includes(layerId))

    // Not all layers are hidden by default
    currentlyHiddenLayers.forEach(layerId => {
      mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'none')
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

    } catch(e) {
      // If it fails, go with the first known layer
      revealFirstLayer(allKnownLayerIds, id)
    }
  }

  /**
   * Reveal layers that were previously enabled (by referencing sessionStorage)
   *  If none were enabled, enable the first layer of the layerSet
   */
  const handleMapsetChange = function handleMapsetChange() {

    if (! activeMapset.value) return // Make TS happy

    const mapset: IMapsetFE = activeMapset.value

    // Reset the local trackers when the map style changes
    currentlyVisibleLayers = []
    currentlyHiddenLayers = []

    // Get all known layer ids for the active mapset
    const allKnownLayerIds = mapset.layerSet.map(layer => layer.id)

    // See if the store has information about layer visibility for this mapset
    const visibleLayers = getVisibleLayersByMapsetId(mapset.id)
    
    // If so, reveal those layers
    if (visibleLayers.length !== 0) {

      console.log("Not going for defaults", visibleLayers)

      applyVisibilityOfLayers(visibleLayers, allKnownLayerIds)
    } 
    
    // Otherwise go for the defaults
    else {

      console.log("Going for defaults")

      // Start by making sure all are hidden
      applyVisibilityOfLayers([], allKnownLayerIds)

      // If the mapset is the preferred default mapset
      if (isDefaultMapset(mapset.id)) {
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

      if (! activeMapset.value) return 

      // Get the visible layers
      const visibleLayers = toRaw(
        getVisibleLayersByMapsetId(activeMapset.value.id)
      )

      // has anything changed? 
      const newlyHidden = currentlyVisibleLayers.filter(layerId => ! visibleLayers.includes(layerId))
      const newlyVisible = visibleLayers.filter(layerId => ! currentlyVisibleLayers.includes(layerId))

      // Only bother mapbox with the actual changes
      if (newlyVisible.length !== 0) {
        newlyVisible.forEach(layerId => {
          mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'visible');
        })
      }

      // Only bother mapbox with the actual changes
      if (newlyHidden.length !== 0) {
        newlyHidden.forEach(layerId => {
          mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'none');
        })
      }

      // Update the local lists
      currentlyVisibleLayers = visibleLayers
      currentlyHiddenLayers = currentlyHiddenLayers
        .filter(layerId => ! currentlyVisibleLayers.includes(layerId))
        .concat(newlyHidden)
    },
    { deep: true, immediate: true }
  )

  /**
   * Attach the map instance
   *  Map is not yet available during setup & watcher needs to start during setup
   */
  const attachMap = function attachMap(map: Map) {
    mapInstance = map

    // handle style ( = mapset ) changes
    mapInstance.on('style.load', handleMapsetChange)

    /**
     * The first map style has been loaded just before the map is attached
     */
    handleMapsetChange()
  }

  /**
   * Disconnect the event handler
   */
  const disconnect = function disconnect() {
    mapInstance?.off('style.load', handleMapsetChange)
    mapInstance = null
  }

  return {
    attachMap,
    disconnect
  }
}

