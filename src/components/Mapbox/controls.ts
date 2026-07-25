

import { GeolocateControl, NavigationControl, type Map } from "maplibre-gl"
import { PitchToggleControl } from "./PitchToggleControl"

export const addControls = function addControls(map: Map) {
  map.addControl(
    new NavigationControl(),
    "bottom-right"
  )

  map.addControl(
    new PitchToggleControl(30),
    "bottom-right"
  )

  map.addControl(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }), "bottom-right"
  )
}

