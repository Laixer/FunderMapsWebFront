

import mapboxgl, { type Map } from "mapbox-gl"
import { PitchToggleControl } from "./PitchToggleControl"

export const addControls = function addControls(map: Map) {
  map.addControl(
    new mapboxgl.NavigationControl(),
    "bottom-right"
  )

  map.addControl(
    new PitchToggleControl(30),
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

