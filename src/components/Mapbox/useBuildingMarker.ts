import { type MaybeRef, shallowRef, watch } from 'vue'
import mapboxgl, { type LngLat, type Map } from 'mapbox-gl'
import { storeToRefs } from 'pinia'

import { useBuildingStore } from '@/store/buildings'
import { useMainStore } from '@/store/main'

// Single marker pinning the most recently clicked building. The geocoder
// API doesn't return building coordinates, so the marker tracks the click
// position (set in useLayerEvents) and the search-result position (set
// from SearchBar). When the building selection clears, the marker hides.
export const useBuildingMarker = function useBuildingMarker(
  Map: MaybeRef<Map | null | undefined>,
) {
  const marker = new mapboxgl.Marker()
  const mapInstance = shallowRef(Map)

  const { buildingId } = storeToRefs(useBuildingStore())
  const { mapMarkerLatLon } = storeToRefs(useMainStore())

  const hide = (): void => { marker.remove() }

  const show = (lngLat: LngLat): void => {
    if (!mapInstance.value) return
    const el = marker.getElement()
    el.style.display = 'none'
    marker.setLngLat(lngLat).addTo(mapInstance.value)
    // Animate the drop-in once mapbox has projected the coordinates.
    requestAnimationFrame(() => {
      el.classList.remove('marker-drop')
      el.style.display = ''
      void el.offsetWidth
      el.classList.add('marker-drop')
    })
  }

  // Clear the marker when no building is selected (sidebar closed or logout).
  watch(buildingId, value => { if (!value) hide() })

  // Show / move the marker whenever a new position is set.
  watch(
    mapMarkerLatLon,
    value => { if (value) show(value); else hide() },
    { immediate: true },
  )

  // If the map mounts after the position was already set, drop the marker now.
  watch(
    () => mapInstance.value,
    () => { if (mapMarkerLatLon.value) show(mapMarkerLatLon.value) },
    { once: true },
  )
}
