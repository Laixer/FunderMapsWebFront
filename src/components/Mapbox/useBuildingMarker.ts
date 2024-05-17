/**
 * Create a single marker on the specified coordinates
 */
import { type ComputedRef, computed, watch, MaybeRef, ref } from "vue"; // WatchStopHandle, 
import mapboxgl, { type Map, type LngLat } from "mapbox-gl";
import { storeToRefs } from "pinia";

import { useBuildingStore } from '@/store/buildings';
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useSessionStore } from "@/store/session";

import { IGeoLocationData } from "@/datastructures/interfaces";

export const useBuildingMarker = function useBuildingMarker(
  Map: MaybeRef<Map | null | undefined>
) {
  const Marker = new mapboxgl.Marker()
  const mapInstance = ref(Map)

  const { isAuthenticated } = storeToRefs(useSessionStore())
  const { buildingId } = storeToRefs(useBuildingStore())
  const { getLocationDataByBuildingId } = useGeoLocationsStore()  

  const locationData: ComputedRef<IGeoLocationData|null> = computed(() => {
    if (! buildingId.value) return null
    return getLocationDataByBuildingId(buildingId.value)
  })


  function show(LngLat: LngLat) {
    if (mapInstance.value) {
      Marker.setLngLat(LngLat).addTo(mapInstance.value)
    }
  }
  function hide() {
    Marker.remove() // Remove from map, not destroy
  }

  /**
   * Show a marker if we have location data with coordinates
   */
  watch(
    () => locationData.value,
    (value: IGeoLocationData|null) => {
      if (value === null) {
        hide()
      }
      else if (value.residence) {
        show(
          new mapboxgl.LngLat(
            value.residence.longitude, 
            value.residence.latitude
          )
        )
      }
    },
    { immediate: true }
  )

  /**
   * Hide marker when user logs out
   *  If a user logs in and we have location data with coordinates, we can show a marker
   */
  watch(
    () => isAuthenticated.value,
    (isAuthenticated) => {
      if (! isAuthenticated) {
        hide()
      } else if (locationData.value && locationData.value.residence) {
        show(
          new mapboxgl.LngLat(
            locationData.value.residence.longitude, 
            locationData.value.residence.latitude
          )
        )
      }
    }
  )
}