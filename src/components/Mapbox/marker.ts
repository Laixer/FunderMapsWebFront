/**
 * Create a single marker on the specified coordinates
 */
import { type ComputedRef, computed, watch, WatchStopHandle } from "vue";
import mapboxgl, { type Map, type LngLat } from "mapbox-gl";
import { storeToRefs } from "pinia";

import { useBuildingStore } from '@/store/buildings';
import { useGeoLocationsStore } from '@/store/building/geolocations'

import { IGeoLocationData } from "@/datastructures/interfaces";

export const useBuildingMarker = function useBuildingMarker(Map: Map): WatchStopHandle {
  const Marker = new mapboxgl.Marker()
  const mapInstance = Map

  const { buildingId } = storeToRefs(useBuildingStore())
  const { getLocationDataByBuildingId } = useGeoLocationsStore()  

  function show(LngLat: LngLat) {
    Marker.setLngLat(LngLat).addTo(mapInstance)
  }
  function hide() {
    Marker.remove() // Remove from map, not destroy
  }

  const locationData: ComputedRef<IGeoLocationData|null> = computed(() => {
    if (! buildingId.value) return null
    return getLocationDataByBuildingId(buildingId.value)
  })

  return watch(
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
}