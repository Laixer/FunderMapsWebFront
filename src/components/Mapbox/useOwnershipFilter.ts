import { ref, watch, type MaybeRef } from "vue";
import { FilterSpecification, type Map } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useFiltersStore } from "@/store/filters"
import { useMapsetStore } from '@/store/mapsets';

export const useGeographyFilter = function useGeographyFilter(
  Map: MaybeRef<Map | null | undefined>
) {
  const { activeMapset } = storeToRefs( useMapsetStore() )

  const { applyOwnershipFilter } = storeToRefs( useFiltersStore() )

  const mapInstance = ref(Map)

  /**
   * Apply the Ownership filter to the layer presentation
   */
  const applyOwnershipFilterToLayers = function applyOwnershipFilterToLayers() {
    console.log("Ownership filter - apply")

    // No map to work with
    if (! mapInstance.value) {
      console.log("Ownership filter - no map instance")
      return
    } 

    // No mapset to work with
    if (! activeMapset.value) {
      console.log("Geography Filter - no active mapset")
      return
    } 

    // construct the geo filter
    let ownershipFilter: FilterSpecification|null = null

    // 

    // Municipality 
    if (
      applyOwnershipFilter.value
    ) {
      ownershipFilter = [
        "match",
        ["get", "ownership_id"],
        activeMapset.value.fenceMunicipality, 
        true,
        false
      ]
    }

    /**
     * Apply the Ownership filter to all active mapset layers 
     */
    for (const layer of activeMapset.value.layerSet) {
      mapInstance.value.setFilter(layer.id, 
        ownershipFilter as FilterSpecification|null
      )
    }
  }


  /**
   * When the map instantiates, attach the style event
   */
  watch(
    () => mapInstance.value,
    (mapInstance, oldMapInstance) => {
      if (mapInstance) {
        console.log("Ownership filter - activate")

        mapInstance?.on('style.load', applyOwnershipFilterToLayers)

        /**
         * The first map style has been loaded just before the map is attached
         */
        applyOwnershipFilterToLayers()
      } else {
        console.log("Ownership filter - deactivate")
        
        oldMapInstance?.off('style.load', applyOwnershipFilterToLayers)
      }
    }
  )
}


