import { type Map } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';

export const useMunicipalityFilter = function useMunicipalityFilter() {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  let mapInstance: Map|null = null

  const enableMapFilter = localStorage.getItem("enableMunicipalityFilter")

  /**
   * Apply the municipality filter to the layer presentation
   */
  const applyMunicipalityFilterToLayers = function applyMunicipalityFilterToLayers() {
    if (mapInstance === null) return // No map to work with
    if (! activeMapset.value) return // No mapset to work with

    // TODO: fenceMunicipality is now an array
    if (activeMapset.value.fenceMunicipality === null) return // No filter necessary

    if (enableMapFilter === 'false') return

    for (const layer of activeMapset.value.layerSet) {
      mapInstance.setFilter(layer.id, [
        'all',
        mapInstance.getFilter(layer.id),
        [
          "match",
          ["get", "municipality_id"],
          [
            activeMapset.value.fenceMunicipality
          ],
          true,
          false
        ]
      ])
    }
  }

  // Map could be supplied directly, but this way it fits in with the rest
  const attachMap = function attachMap(map: Map) {
    mapInstance = map
    mapInstance.on('style.load', applyMunicipalityFilterToLayers)

    // When attached, the initial style has already been loaded
    applyMunicipalityFilterToLayers()
  }

  const disconnect = function disconnect() {
    if (mapInstance) {
      mapInstance.off('style.load', applyMunicipalityFilterToLayers)
    }
  }

  return {
    attachMap,
    disconnect
  }
}


