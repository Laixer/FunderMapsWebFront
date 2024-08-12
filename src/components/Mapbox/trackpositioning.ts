import { type Map } from "mapbox-gl";

/**
 * Reference to the Mapbox instance
 */
let mapInstance: Map|null = null;

import { useMetadataStore } from '@/store/metadata';


/***********************************************************************************
 * Public functions
 **********************************************************************************/

export const getLastKnownPositioning = function getLastKnownPositioning() {

  let center = undefined

  const metadataStore = useMetadataStore()

  try {
    // center = localStorage.getItem('lastCenterPosition') ? JSON.parse(localStorage.getItem('lastCenterPosition') as string) : undefined
    center = metadataStore.getItem('lastCenterPosition')
  } catch(e) {
    console.log("Failed to retrieve center position from localstorage. Starting from default location.")
  }

  return {
    center,
    zoom: metadataStore.getItem('lastZoomLevel') ? parseFloat(metadataStore.getItem('lastZoomLevel') as string) : undefined,
    pitch: metadataStore.getItem('lastPitchDegree') ? parseFloat(metadataStore.getItem('lastPitchDegree') as string) : undefined,
    bearing: metadataStore.getItem('lastRotation') ? parseFloat(metadataStore.getItem('lastRotation') as string) : undefined,
  }
}

export const startTrackingPositioning = function startTrackingPositioning(map: Map) {
  mapInstance = map

  map.on('moveend', storeLastCenterPosition);
  map.on('zoomend', storeLastZoomLevel);
  map.on('pitchend', storeLastPitchDegree);
  map.on('rotateend', storeLastRotation);

  storeLastCenterPosition()
  storeLastZoomLevel()
  storeLastPitchDegree()
  storeLastRotation()
}

export const stopTrackingPositioning = function stopTrackingPositioning() {
  if (mapInstance) {
    mapInstance.off('moveend', storeLastCenterPosition);
    mapInstance.off('zoomend', storeLastZoomLevel);
    mapInstance.off('pitchend', storeLastPitchDegree);
    mapInstance.off('rotateend', storeLastRotation);

    mapInstance = null
  }
}

/***********************************************************************************
 * Internal functions
 **********************************************************************************/

const storeLastCenterPosition = function storeLastCenterPosition() {
  if (mapInstance === null) return
  const metadataStore = useMetadataStore()
  metadataStore.setItem('lastCenterPosition', mapInstance.getCenter());
}

const storeLastZoomLevel = function storeLastZoomLevel() {
  if (mapInstance === null) return
  const metadataStore = useMetadataStore()
  metadataStore.setItem('lastZoomLevel', mapInstance.getZoom().toString())
}

const storeLastPitchDegree = function storeLastPitchDegree() {
  if (mapInstance === null) return
  const metadataStore = useMetadataStore()
  metadataStore.setItem('lastPitchDegree', mapInstance.getPitch().toString())
}

const storeLastRotation = function storeLastRotation() {
  if (mapInstance === null) return
  const metadataStore = useMetadataStore()
  metadataStore.setItem('lastRotation', mapInstance.getBearing().toString())
}