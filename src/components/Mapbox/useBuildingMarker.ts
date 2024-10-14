/**
 * Create a single marker on the specified coordinates
 */
import { type ComputedRef, computed, watch, MaybeRef, ref } from "vue"; 
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
  const { getLocationDataByBuildingId } = useGeoLocationsStore()  


  const { mapMarkerLatLon } = storeToRefs( useMainStore() )

  const locationData: ComputedRef<IGeoLocationData|null> = computed(() => {
    if (! buildingId.value) return null
    return getLocationDataByBuildingId(buildingId.value)
  })

  function hide() {
    // Remove from map, not destroy
    Marker.remove() 
  }

  function show(LngLat: LngLat) {
    
    if (mapInstance.value) {
      // TODO: mapInstance.value - Type instantiation is excessively deep and possibly infinite.
      // @ts-ignore 
      Marker.setLngLat(LngLat).addTo(mapInstance.value)
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