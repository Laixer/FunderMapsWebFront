import { ref, watch, type MaybeRef } from "vue";
import { FilterSpecification, type Map } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';

/**
 * TODO: Refactor logic. Add fencing filters right after adding layers upon mapset switch.
 */

export const useGeographyFilter = function useGeographyFilter(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const mapInstance = ref(Map)

  const enableMapFilter = localStorage.getItem("enableGeographyFilter")

  let previouslyFilteredMapsetId: string|null = null


  /**
   * Check whether all systems are go
   */
  const checkRequirements = function checkRequirements() {

    // No map to work with
    if (! mapInstance.value) {
      console.log("Geography Filter - no map instance")
      return false
    } 

    // No mapset to work with
    if (! activeMapset.value) {
      console.log("Geography Filter - no active mapset")
      return false
    } 

    // Disabled
    if (enableMapFilter === 'false')  {
      console.log("Geography Filter - functionality disabled")
      return false
    }

    return true
  }

  /**
   * Generate a Mapbox Style segment to filter features based on fencing properties
   */
  const generateFencing = function(property: string, source: 'fenceMunicipality'|'fenceDistrict'|'fenceNeighborhood') {
    let geoFilter = []

    if (
      Array.isArray(activeMapset.value?.[source]) 
      && activeMapset.value[source].length !== 0
    ) {
      geoFilter.push('any')
      geoFilter.push([
        "match",
        ["get", property],
        activeMapset.value[source], 
        true,
        false
      ])
      // in case the prop is not available the feature is shown
      geoFilter.push([
        '!', ["has", property] 
      ])
    }

    return geoFilter
  }


  /**
   * Apply the Geography Filter to the layer presentation
   */
  const applyGeographyFilterToLayers = function applyGeographyFilterToLayers() {
    console.log("Geography Filter - apply")

    if (! checkRequirements()) {
      return
    }

    // Avoid applying the filters twice.
    if (activeMapset.value?.id === previouslyFilteredMapsetId) {
      return
    }
    previouslyFilteredMapsetId = activeMapset.value?.id || null
    
    // construct the geo filter
    const geoFilter: any[] = [].concat(
      generateFencing('municipality_id', 'fenceMunicipality') as [], // Make TS shut up
      generateFencing('district_id', 'fenceDistrict') as [], // Make TS shut up
      generateFencing('neighborhood_id', 'fenceNeighborhood') as [], // Make TS shut up
    )

    // No geofilter = no need to modify the layer style
    if (geoFilter.length === 0) {
      console.log("Geography Filter - no fence")
      return
    }

    /**
     * Apply the Geography Filter to all active mapset layers 
     */
    for (const layer of activeMapset.value?.layerSet || []) {

      const currentFilter = mapInstance.value?.getFilter(layer.id)
      if (currentFilter) {
        mapInstance.value?.setFilter(layer.id, [
          'all',
          currentFilter,
          geoFilter as FilterSpecification
        ])
      } else {
        mapInstance.value?.setFilter(layer.id, 
          geoFilter as FilterSpecification
        )
      }
    }
  }

  /**
   * Whenever the active mapset changes the filters need to be updated
   */
  watch(
    () => activeMapset.value,
    () => applyGeographyFilterToLayers()
  )


  /**
   * When the map instantiates
   */
  watch(
    () => mapInstance.value,
    () => applyGeographyFilterToLayers(), 
    { once: true }
  )
}


