import { type Map } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { ref, watch, type MaybeRef } from "vue";

export const useMunicipalityFilter = function useMunicipalityFilter(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const mapInstance = ref(Map)

  const enableMapFilter = localStorage.getItem("enableMunicipalityFilter")

  /**
   * Apply the municipality filter to the layer presentation
   */
  const applyMunicipalityFilterToLayers = function applyMunicipalityFilterToLayers() {
    console.log("Municipality Filter - apply")

    // No map to work with
    if (! mapInstance.value) {
      console.log("Municipality Filter - no map instance")
      return
    } 

    // No mapset to work with
    if (! activeMapset.value) {
      console.log("Municipality Filter - no active mapset")
      return
    } 

    // TODO: fenceMunicipality is now an array
    // No filter necessary
    if (activeMapset.value.fenceMunicipality === null) {
      console.log("Municipality Filter - no fence")
      return
    } 

    // Disabled
    if (enableMapFilter === 'false')  {
      console.log("Municipality Filter - functionality disabled")
      return
    } 

    for (const layer of activeMapset.value.layerSet) {
      mapInstance.value.setFilter(layer.id, [
        'all',
        mapInstance.value.getFilter(layer.id),
        [
          "match",
          ["get", "municipality_id"],
          activeMapset.value.fenceMunicipality, // TODO: Not sure if this is correct
          true,
          false
        ]
      ])
    }
  }


  /**
   * When the map instantiates, attach the style event
   */
  watch(
    () => mapInstance.value,
    (mapInstance, oldMapInstance) => {
      if (mapInstance) {
        console.log("Municipality Filter - activate")

        mapInstance?.on('style.load', applyMunicipalityFilterToLayers)

        /**
         * The first map style has been loaded just before the map is attached
         */
        applyMunicipalityFilterToLayers()
      } else {
        console.log("Municipality Filter - deactivate")
        
        oldMapInstance?.off('style.load', applyMunicipalityFilterToLayers)
      }
    }
  )
}


