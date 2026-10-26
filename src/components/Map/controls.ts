

import { GeolocateControl, NavigationControl, type Map } from "maplibre-gl"
import { PitchToggleControl } from "./PitchToggleControl"

// MapLibre's own texts are English: the titles of the buttons added below, the
// name of the map and of the marker. Given to the map as its `locale`
// (Map.vue); only the texts this app can show are listed.
export const mapLocale: Record<string, string> = {
  'AttributionControl.ToggleAttribution': 'Bronvermelding van de kaart tonen of verbergen',
  'GeolocateControl.FindMyLocation': 'Mijn locatie zoeken',
  'GeolocateControl.LocationNotAvailable': 'Locatie niet beschikbaar',
  'Map.Title': 'Kaart',
  'Marker.Title': 'Markering op de kaart',
  'NavigationControl.ResetBearing': 'Sleep om de kaart te draaien, klik om het noorden boven te zetten',
  'NavigationControl.ZoomIn': 'Inzoomen',
  'NavigationControl.ZoomOut': 'Uitzoomen',
}

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

