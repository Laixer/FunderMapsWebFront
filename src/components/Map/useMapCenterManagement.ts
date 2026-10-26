import { LngLat, type LngLatLike, type Map } from "maplibre-gl"
import { storeToRefs } from "pinia"
import { computed, nextTick, watch } from "vue"
import { useRoute } from "vue-router"

import { useMainStore } from '@/store/main';
import { useBuildingStore } from '@/store/buildings';
import { useMapsetStore } from '@/store/mapsets';
import { useGeoLocationsStore } from '@/store/building/geolocations'

import { IGeoLocationData } from "@/datastructures/interfaces";

/**
 * TODO: Refactor to useEvent structure, being self reliant 
 */
export const useMapCenterManagement = function useMapCenterManagement() {

  const { mapCenterLatLon, mapMarkerLatLon } = storeToRefs( useMainStore() )
  const { buildingId } = storeToRefs(useBuildingStore())
  const locationStore = useGeoLocationsStore()
  const { activeMapset } = storeToRefs( useMapsetStore() )


  // Reference to the map instance
  let mapInstance: Map|null = null

  // A flag we use to track when the watcher should ignore center changes
  let ignoreCenterChange: boolean = false

  // Whether the page was opened on a pand: a shared link, a bookmark, a link
  // from the Studio. Read once, during setup.
  const route = useRoute()
  const openedOnBuilding = typeof route.params.buildingId === 'string' && route.params.buildingId !== ''

  // That pand still has to be put on the map (see showLinkedBuilding)
  let linkedBuildingPending = openedOnBuilding

  // The first mapset to load must not pull the map away from that pand
  let firstMapsetSeen = false

  const locationData = computed(() => {
    if (! buildingId.value) return null
    return locationStore.getData(buildingId.value)
  })

  const flyToCenter = function flyToCenter(center: LngLatLike) {
    if (! mapInstance) return

    // Set some zoom limits that make sense when flying
    let zoom = mapInstance.getZoom()
    if (zoom > 18) zoom = 18
    if (zoom < 16) zoom = 16


    mapInstance.flyTo({
      center,
      essential: true,
      zoom
    })
  }

  /**
   * Put the pand the page was opened on in view, with its marker.
   *
   * A click on the map and a search both say where the pand is themselves
   * (useLayerEvents, SearchBar). A link says nothing, so the map stayed where
   * it started (the saved position, or the default centre) with the pand's
   * details beside it and no marker. Done once, for that first pand only: a
   * pand picked by hand must not move the map under the cursor.
   *
   * Returns whether the map was sent there.
   */
  const showLinkedBuilding = function showLinkedBuilding(location: IGeoLocationData|null): boolean {
    if (! linkedBuildingPending || ! location || ! mapInstance) return false

    // A click or a search got there first and placed the marker itself
    if (mapMarkerLatLon.value) {
      linkedBuildingPending = false
      return false
    }

    const { latitude, longitude } = location.building
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return false

    linkedBuildingPending = false
    const lngLat = new LngLat(longitude, latitude)
    mapMarkerLatLon.value = lngLat
    mapCenterLatLon.value = lngLat
    return true
  }

  watch(
    () => locationData.value,
    (location: IGeoLocationData|null) => { showLinkedBuilding(location) },
    { immediate: true }
  )


  /**
   * Fly to a location if the mapcenter value is changed
   */
  watch(
    () => mapCenterLatLon.value,
    (center: LngLat|null) => {

      // We use `ignoreCenterChange` to ignore changes caused by `handleMapMovement`
      if (! mapInstance || center === null || ignoreCenterChange === true) {
        return
      }

      flyToCenter(center)
    }, 
    { immediate: true }
  )

  watch(
    () => activeMapset.value,
    (mapset) => {
      // We use `ignoreCenterChange` to ignore changes caused by `handleMapMovement`
      if (! mapInstance || ! mapset || ignoreCenterChange === true) {
        return
      }

      // The page was opened on a pand: the mapset that comes with it is not a
      // reason to go to the mapset's own centre instead.
      const isFirstMapset = ! firstMapsetSeen
      firstMapsetSeen = true
      if (isFirstMapset && openedOnBuilding) return

      if (mapset.metadata?.center) {
        flyToCenter(mapset.metadata.center as LngLatLike)
      }
    },
    { immediate: true }
  )

  /**
   * When the map moves, update the known center position
   */
  const handleMapMovement = function handleMapMovement() {
    ignoreCenterChange = true
    mapCenterLatLon.value = mapInstance?.getCenter() || null

    // ignore center changes for this iteration
    nextTick(() => {
      ignoreCenterChange = false
    })
  }

  /**
   * Attach the map instance
   *  Map is not yet available during setup & watcher needs to start during setup
   */
  const attachMap = function attachMap(map: Map) {
    mapInstance = map

    mapInstance.on('moveend', handleMapMovement)
    
    if (showLinkedBuilding(locationData.value)) {
      // on its way to the pand
    } else if (activeMapset.value?.metadata?.center && ! openedOnBuilding) {
      flyToCenter(
        activeMapset.value.metadata.center as LngLatLike
      )
    } else {
      handleMapMovement()
    }
  }

  const disconnect = function disconnect() {
    if (mapInstance) {
      mapInstance.off('moveend', handleMapMovement)
    }
    mapInstance = null
  }

  return {
    attachMap,
    disconnect
  }
}