import { type Map } from "mapbox-gl";

/**
 * Reference to the Mapbox instance
 */
let mapInstance: Map|null = null;

/***********************************************************************************
 * Public functions
 **********************************************************************************/

export const getLastKnownPositioning = function getLastKnownPositioning() {
  return {
    center: localStorage.getItem('lastCenterPosition') ? JSON.parse(localStorage.getItem('lastCenterPosition') as string) : undefined,
    zoom: localStorage.getItem('lastZoomLevel') ? parseFloat(localStorage.getItem('lastZoomLevel') as string) : undefined,
    pitch: localStorage.getItem('lastPitchDegree') ? parseFloat(localStorage.getItem('lastPitchDegree') as string) : undefined,
    bearing: localStorage.getItem('lastRotation') ? parseFloat(localStorage.getItem('lastRotation') as string) : undefined,
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
  localStorage.setItem('lastCenterPosition', JSON.stringify(mapInstance.getCenter()));
}

const storeLastZoomLevel = function storeLastZoomLevel() {
  if (mapInstance === null) return
  localStorage.setItem('lastZoomLevel', mapInstance.getZoom().toString())
}

const storeLastPitchDegree = function storeLastPitchDegree() {
  if (mapInstance === null) return
  localStorage.setItem('lastPitchDegree', mapInstance.getPitch().toString())
}

const storeLastRotation = function storeLastRotation() {
  if (mapInstance === null) return
  localStorage.setItem('lastRotation', mapInstance.getBearing().toString())
}