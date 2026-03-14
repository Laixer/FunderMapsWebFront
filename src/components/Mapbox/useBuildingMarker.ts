/**
 * Create a single marker on the specified coordinates
 */
import { computed, watch, type MaybeRef, ref } from "vue";
import mapboxgl, { type Map, type LngLat } from "mapbox-gl";
import { storeToRefs } from "pinia";

import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from "@/store/main";
import { useGeoLocationsStore } from '@/store/building/geolocations'

import { IGeoLocationData } from "@/datastructures/interfaces";


export const useBuildingMarker = function useBuildingMarker(
  Map: MaybeRef<Map | null | undefined>
) {
  const Marker = new mapboxgl.Marker()
  const mapInstance = ref(Map)

  const { buildingId } = storeToRefs(useBuildingStore())
  const locationStore = useGeoLocationsStore()

  const { mapMarkerLatLon } = storeToRefs( useMainStore() )

  const locationData = computed<IGeoLocationData|null>(() => {
    if (! buildingId.value) return null
    return locationStore.getData(buildingId.value)
  })

  function hide() {
    // Remove from map, not destroy
    Marker.remove() 
  }

  function show(LngLat: LngLat) {
    if (mapInstance.value) {
      const el = Marker.getElement()

      // Hide until Mapbox has projected the coordinates to screen position
      el.style.display = 'none'

      Marker.setLngLat(LngLat).addTo(mapInstance.value as Map)

      // Wait for Mapbox to update the transform, then animate in
      requestAnimationFrame(() => {
        el.classList.remove('marker-drop')
        el.style.display = ''
        void el.offsetWidth
        el.classList.add('marker-drop')
      })
    }
  }

  function maybeShownResidence() {
    if (locationData.value && locationData.value.residence) {
      show(
        new mapboxgl.LngLat(
          locationData.value.residence.longitude, 
          locationData.value.residence.latitude
        )
      )
    }
  }
  
  /**
   * Show a marker if we have location data with coordinates
   */
  watch(
    () => locationData.value,
    (value: IGeoLocationData|null) => {
      if (value === null) {
        hide()
      } else {
        maybeShownResidence()
      }
    },
    { immediate: true }
  )

  /**
   * Show a marker if LngLat coordinates are provided, and no building is selected
   */
  watch(
    () => mapMarkerLatLon.value,
    (value: LngLat|null) => {
      if (locationData.value && locationData.value.residence) {
        return
      }

      if (value === null) {
        hide()
      } else {
        show(value)
      }
    },
   { immediate: true }
  )

  /**
   * When the map instantiates, show the marker if one can be shown
   */
  watch(
    () => mapInstance.value,
    () => maybeShownResidence(), 
    { once: true }
  )
}