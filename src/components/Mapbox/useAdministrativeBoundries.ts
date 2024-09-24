
import { type MaybeRef, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { LayerSpecification, type Map } from "mapbox-gl";

import { useLayersStore } from "@/store/layers";

import { useMapSources } from "./useMapSources";


/**
 * TODO: Remove a source ?
 */
export const useAdminstrativeBoundaries = function useAdminstrativeBoundaries(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = ref(Map)

  const {
    addSource
  } = useMapSources(Map)

  const { showAdministrativeBoundaries } = storeToRefs(useLayersStore())
  
  const boundaryLayers = [
    'boundry-municipality',
    'boundry-neighborhood',
    'boundry-district'
  ]

  // TODO: Get from API 
  const getLayerSpecificationById = async function getLayerSpecificationById(layerId: string) {
    return (await import(`../../config/layers/${layerId}.json`)).default
  }

  /**
   * Set the visibility of all the boundary layers, 
   * based on the toggle state (showAdministrativeBoundaries)
   */
  const applyVisibility = async function applyVisibility() {

    // Too eager
    if (! mapInstance.value) {
      return
    }

    const visible = !! showAdministrativeBoundaries.value

    for(let layerId of boundaryLayers) {
      if (mapInstance.value.getLayer(layerId)) {
        mapInstance.value.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
      }
    }
  }

  /**
   * Add the administrative boundary layers
   */
  const addBoundaries = async function addBoundaries() {

    // Too eager
    if (! mapInstance.value) {
      return
    }
    
    for(let layerId of boundaryLayers) {
      if (! mapInstance.value.getLayer(layerId)) {
        try {
          const layerSpecification: LayerSpecification = await getLayerSpecificationById(layerId)

          if (layerSpecification.source) {
            addSource(layerSpecification.source)
          }

          mapInstance.value.addLayer(layerSpecification)
        } catch(e) {
          console.error(e)
        }
      }
    }

    // Set the visibility of the layers
    applyVisibility()
  }

  /**
   * When the map instantiates we add the layers for the first time
   */
  watch(
    () => mapInstance.value,
    () => addBoundaries(), 
    { once: true }
  )
  
  /**
   * Whenever the toggle value changes, the visibility is set
   */
  watch(
    () => showAdministrativeBoundaries.value, 
    applyVisibility
  )
}

