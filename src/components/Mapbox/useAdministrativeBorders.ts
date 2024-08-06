/**
 * Administrative borders (municipality, district, neighborhood)
 * 
 *  Bound to borders toggle
 */
import { ref, watch, type MaybeRef } from "vue";
import { type Map } from "mapbox-gl"

export const useAdministrativeBorders = function(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = ref(Map)


  const applyAdministrativeBoundaries = function applyAdministrativeBoundaries() {

    // TODO: check store for Borders toggle state
    // TODO:  have Borders toggle state linked to user profile ?
    // TODO:  show / hide borders layer

    
    // mapInstance.value.setLayoutProperty(layerId, 'visibility', 'visible')
    // mapInstance.value.setLayoutProperty(layerId, 'visibility', 'none')
  }

  // TODO: Watch Border toggle

  /**
   * When the map instantiates, attach the style event
   */
  watch(
    () => mapInstance.value,
    (mapInstance, oldMapInstance) => {
      if (mapInstance) {
        console.log("Adminstrative boundaries - activate")

        mapInstance?.on('style.load', applyAdministrativeBoundaries)

        /**
         * The first map style has been loaded just before the map is attached
         */
        applyAdministrativeBoundaries()
      } else {
        console.log("Administrative boundaries - deactivate")
        
        oldMapInstance?.off('style.load', applyAdministrativeBoundaries)
      }
    }
  )
}