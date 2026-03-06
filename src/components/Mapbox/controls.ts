

import mapboxgl, { type Map } from "mapbox-gl"

export const addControls = function addControls(map: Map) {
  map.addControl(
    new mapboxgl.NavigationControl(), 
    "bottom-right"
  )
  
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }), "bottom-right"
  )
}

