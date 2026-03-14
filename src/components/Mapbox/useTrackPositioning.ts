import { type Map } from "mapbox-gl";
import { type MaybeRef, watch, shallowRef } from "vue";

import { useMetadataStore } from '@/store/metadata';


export const useTrackPositioning = function useTrackPositioning(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = shallowRef(Map)

  /***********************************************************************************
   * Internal functions
   **********************************************************************************/

  const storeLastCenterPosition = function storeLastCenterPosition() {
    if (! mapInstance.value) return

    const metadataStore = useMetadataStore()
    const center = mapInstance.value.getCenter();
    metadataStore.setItem('lastCenterPosition', JSON.parse(JSON.stringify(center)));
  }

  const storeLastZoomLevel = function storeLastZoomLevel() {
    if (! mapInstance.value) return

    const metadataStore = useMetadataStore()
    metadataStore.setItem('lastZoomLevel', mapInstance.value.getZoom().toString())
  }

  const storeLastPitchDegree = function storeLastPitchDegree() {
    if (! mapInstance.value) return

    const metadataStore = useMetadataStore()
    metadataStore.setItem('lastPitchDegree', mapInstance.value.getPitch().toString())
  }

  const storeLastRotation = function storeLastRotation() {
    if (! mapInstance.value) return

    const metadataStore = useMetadataStore()
    metadataStore.setItem('lastRotation', mapInstance.value.getBearing().toString())
  }


  const attachEventHandlers = function attachEventHandlers() {
    if (! mapInstance.value) return 

    mapInstance.value.on('moveend', storeLastCenterPosition);
    mapInstance.value.on('zoomend', storeLastZoomLevel);
    mapInstance.value.on('pitchend', storeLastPitchDegree);
    mapInstance.value.on('rotateend', storeLastRotation);

    storeLastCenterPosition()
    storeLastZoomLevel()
    storeLastPitchDegree()
    storeLastRotation()
  }

  watch(
    () => mapInstance.value,
    () => attachEventHandlers(),
    { once: true }
  )

  return {
    // TODO: Move to a store ? 
    getLastKnownPositioning: function getLastKnownPositioning() {
      const metadataStore = useMetadataStore()
      let center

      try {
        center = metadataStore.getItem('lastCenterPosition')
      } catch {
        console.warn("Failed to read center position from localStorage, using default")
      }
    
      return {
        center,
        zoom: metadataStore.getItem('lastZoomLevel') ? parseFloat(metadataStore.getItem('lastZoomLevel') as string) : undefined,
        pitch: metadataStore.getItem('lastPitchDegree') ? parseFloat(metadataStore.getItem('lastPitchDegree') as string) : undefined,
        bearing: metadataStore.getItem('lastRotation') ? parseFloat(metadataStore.getItem('lastRotation') as string) : undefined,
      }
    }
  }
}