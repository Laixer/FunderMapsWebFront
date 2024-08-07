import { FilterSpecification, type Map } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { ref, watch, type MaybeRef } from "vue";

export const useGeographyFilter = function useGeographyFilter(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const mapInstance = ref(Map)

  const enableMapFilter = localStorage.getItem("enableGeographyFilter")

  /**
   * Apply the Geography Filter to the layer presentation
   */
  const applyGeographyFilterToLayers = function applyGeographyFilterToLayers() {
    console.log("Geography Filter - apply")

    // No map to work with
    if (! mapInstance.value) {
      console.log("Geography Filter - no map instance")
      return
    } 

    // No mapset to work with
    if (! activeMapset.value) {
      console.log("Geography Filter - no active mapset")
      return
    } 

    // Disabled
    if (enableMapFilter === 'false')  {
      console.log("Geography Filter - functionality disabled")
      return
    } 

    
    // construct the geo filter
    let geoFilter = []

    // Municipality 
    if (
      Array.isArray(activeMapset.value.fenceMunicipality) 
      && activeMapset.value.fenceMunicipality.length !== 0
    ) {
      geoFilter.push('any')
      geoFilter.push([
        "match",
        ["get", "municipality_id"],
        activeMapset.value.fenceMunicipality, 
        true,
        false
      ])
      // in case municipality_id prop is not available
      geoFilter.push([
        '!', ["has", "municipality_id"] 
      ])
    }

    // District
    if (
      Array.isArray(activeMapset.value.fenceDistrict) 
      && activeMapset.value.fenceDistrict.length !== 0
    ) {
      if (geoFilter.length === 0) {
        geoFilter.push('any')
      }
      geoFilter.push([
        "match",
        ["get", "district_id"],
        activeMapset.value.fenceDistrict, 
        true,
        false
      ]) 
      // in case district_id prop is not available
      geoFilter.push([
        '!', ["has", "district_id"] 
      ])
    }
    
    // Neighborhood
    if (
      Array.isArray(activeMapset.value.fenceNeighborhood) 
      && activeMapset.value.fenceNeighborhood.length !== 0
    ) {
      if (geoFilter.length === 0) {
        geoFilter.push('any')
      }
      geoFilter.push([
        "match",
        ["get", "neighborhood_id"],
        activeMapset.value.fenceNeighborhood, 
        true,
        false
      ])
      // in case neightborhood_id prop is not available
      geoFilter.push([
        '!', ["has", "neighborhood_id"]
      ])
    }

    // No geofilter = no need to modify the layer style
    if (
      geoFilter.length === 0
    ) {
      console.log("Geography Filter - no fence")
      return
    }

    /**
     * Apply the Geography Filter to all active mapset layers 
     */
    for (const layer of activeMapset.value.layerSet) {

      const currentFilter = mapInstance.value.getFilter(layer.id)
      if (currentFilter) {
        mapInstance.value.setFilter(layer.id, [
          'all',
          currentFilter,
          geoFilter as FilterSpecification
        ])
      } else {
        mapInstance.value.setFilter(layer.id, 
          geoFilter as FilterSpecification
        )
      }
    }
  }


  /**
   * When the map instantiates, attach the style event
   */
  watch(
    () => mapInstance.value,
    (mapInstance, oldMapInstance) => {
      if (mapInstance) {
        console.log("Geography Filter - activate")

        mapInstance?.on('style.load', applyGeographyFilterToLayers)

        /**
         * The first map style has been loaded just before the map is attached
         */
        applyGeographyFilterToLayers()
      } else {
        console.log("Geography Filter - deactivate")
        
        oldMapInstance?.off('style.load', applyGeographyFilterToLayers)
      }
    }
  )
}


