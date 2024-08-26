import { type FilterSpecification, type LayerSpecification } from "mapbox-gl"
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';
import { IMapsetFE } from "@/datastructures/interfaces";


export const useGeographyFilter = function useGeographyFilter() {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const enableMapFilter = localStorage.getItem("enableGeographyFilter")

  /**
   * Cached filter specifications 
   */
  const geoFilterByMapsetId: Record<string,FilterSpecification> = {}

  /**
   * Generate a Mapbox Style segment to filter features based on fencing properties
   */
  const generateFencing = function(
    property: string, 
    source: 'fenceMunicipality'|'fenceDistrict'|'fenceNeighborhood',
    mapset?: IMapsetFE|undefined
  ) {

    mapset = mapset || activeMapset.value || undefined

    // Cached value
    if (mapset && geoFilterByMapsetId[mapset.id]) {
      return geoFilterByMapsetId[mapset.id]
    }

    let geoFilter = []

    if (
      mapset &&
      Array.isArray(mapset?.[source]) 
      && mapset[source].length !== 0
    ) {
      // geoFilter.push('any')
      geoFilter.push([
        "match",
        ["get", property],
        mapset[source], 
        true,
        false
      ])
      // in case the prop is not available the feature is shown
      geoFilter.push([
        '!', ["has", property] 
      ])

      geoFilterByMapsetId[mapset.id] = geoFilter as FilterSpecification
    }

    return geoFilter
  }

  /**
   * Apply the Geography Filter to the layer presentation
   */
  const applyGeographyFilterToLayerSpecification = function applyGeographyFilterToLayerSpecification(
    specification: LayerSpecification,
    mapset?: IMapsetFE|undefined
  ) {
    if (enableMapFilter === 'false')  {
      return specification
    }
    
    // construct the geo filter
    const geoFilter: FilterSpecification = [].concat(
      generateFencing('municipality_id', 'fenceMunicipality', mapset) as [], // Make TS shut up
      generateFencing('district_id', 'fenceDistrict', mapset) as [], // Make TS shut up
      generateFencing('neighborhood_id', 'fenceNeighborhood', mapset) as [], // Make TS shut up
    )

    // No geofilter = no need to modify the layer style
    if (geoFilter.length === 0) {
      return specification
    } else {
      geoFilter.unshift(
        'any'
      )
    }

    /**
     * Apply the Geography Filter to the specification
     */
    if (specification.filter) {
      specification.filter = [
        'all',
        specification.filter,
        geoFilter
      ]
    } else {
      specification.filter = geoFilter
    }
    
    return specification
  }

  return {
    applyGeographyFilterToLayerSpecification
  }
}


