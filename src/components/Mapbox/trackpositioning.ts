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
    center: sessionStorage.getItem('lastCenterPosition') ? JSON.parse(sessionStorage.getItem('lastCenterPosition') as string) : undefined,
    zoom: sessionStorage.getItem('storeLastZoomLevel') ? parseFloat(sessionStorage.getItem('storeLastZoomLevel') as string) : undefined,
    pitch: sessionStorage.getItem('lastPitchDegree') ? parseFloat(sessionStorage.getItem('lastPitchDegree') as string) : undefined
  }
}

export const startTrackingPositioning = function startTrackingPositioning(map: Map) {
  mapInstance = map

  map.on('moveend', storeLastCenterPosition);
  map.on('zoomend', storeLastZoomLevel);
  map.on('pitchend', storeLastPitchDegree);
}

export const stopTrackingPositioning = function stopTrackingPositioning() {
  if (mapInstance) {
    mapInstance.off('moveend', storeLastCenterPosition);
    mapInstance.off('zoomend', storeLastZoomLevel);
    mapInstance.off('pitchend', storeLastPitchDegree);

    mapInstance = null
  }
}

/***********************************************************************************
 * Internal functions
 **********************************************************************************/

const storeLastCenterPosition = function storeLastCenterPosition() {
  if (mapInstance === null) return
  sessionStorage.setItem('lastCenterPosition', JSON.stringify(mapInstance.getCenter()));
}

const storeLastZoomLevel = function storeLastZoomLevel() {
  if (mapInstance === null) return
  sessionStorage.setItem('storeLastZoomLevel', mapInstance.getZoom().toString())
}

const storeLastPitchDegree = function storeLastPitchDegree() {
  if (mapInstance === null) return
  sessionStorage.setItem('lastPitchDegree', mapInstance.getPitch().toString())
}