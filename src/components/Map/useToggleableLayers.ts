
import { type MaybeRef, type Ref, shallowRef, watch } from "vue";
import { type LayerSpecification, type Map } from "maplibre-gl";

// Our layer configs (config/layers/*.json) are always data layers, never
// background — background layers lack filter/source, which the plain
// LayerSpecification union would otherwise forbid accessing.
type DataLayerSpecification = Exclude<LayerSpecification, { type: 'background' }>

import { useMapSources } from "./useMapSources";


export const useToggleableLayers = function useToggleableLayers(
  Map: MaybeRef<Map | null | undefined>,
  toggleValue: Ref,
  layers: string[],
  // True while something else decides about these layers (a mapset that has
  // them in its own legend). The toggle then leaves them alone.
  isManagedElsewhere?: Ref<boolean>
) {

  const mapInstance = shallowRef(Map)

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

    // Not ours to show or hide right now
    if (isManagedElsewhere?.value) {
      return
    }

    const visible = !! toggleValue.value

    for(const layerId of layers) {
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

    // Not ours to add right now
    if (isManagedElsewhere?.value) {
      return
    }
    
    for(const layerId of layers) {
      if (! mapInstance.value.getLayer(layerId)) {
        try {
          const layerSpecification: DataLayerSpecification = await getLayerSpecificationById(layerId)

          if (layerSpecification.source) {
            addSource(layerSpecification.source)
          }

          // Re-check after async import — another composable may have added it
          if (! mapInstance.value.getLayer(layerId)) {
            mapInstance.value.addLayer(layerSpecification)
          }
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

  /**
   * When the layers are ours again (the mapset that had them in its legend
   *  was left), put them back as the toggle says. That mapset removes its
   *  layers from the map when it goes, these included: hence add, and hence
   *  after the other watchers have run (flush: post).
   */
  if (isManagedElsewhere) {
    watch(
      () => isManagedElsewhere.value,
      (isManaged) => { if (! isManaged) addLayers() },
      { flush: 'post' }
    )
  }
}

