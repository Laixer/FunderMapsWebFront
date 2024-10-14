
import { type MaybeRef, type Ref, ref, watch } from "vue";
import { LayerSpecification, type Map } from "mapbox-gl";

import { useMapSources } from "./useMapSources";


export const useToggleableLayers = function useToggleableLayers(
  Map: MaybeRef<Map | null | undefined>,
  toggleValue: Ref,
  layers: string[]
) {

  const mapInstance = ref(Map)

  const {
    addSource
  } = useMapSources(Map)

  // TODO: Get from API 
  const getLayerSpecificationById = async function getLayerSpecificationById(layerId: string) {
    return (await import(`../../config/layers/${layerId}.json`)).default
  }

  /**
   * Set the visibility of all the boundary layers, 
   * based on the toggle state
   */
  const applyVisibility = async function applyVisibility() {

    // Too eager
    if (! mapInstance.value) {
      return
    }

    const visible = !! toggleValue.value

    for(let layerId of layers) {
      if (mapInstance.value.getLayer(layerId)) {
        mapInstance.value.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
      }
    }
  }

  /**
   * Add the layers
   */
  const addLayers = async function addLayers() {

    // Too eager
    if (! mapInstance.value) {
      return
    }
    
    for(let layerId of layers) {
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
    () => addLayers(), 
    { once: true }
  )
  
  /**
   * Whenever the toggle value changes, the visibility is set
   */
  watch(
    () => toggleValue.value, 
    applyVisibility
  )
}

