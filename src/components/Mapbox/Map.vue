<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';

import MapBox from '@/components/Common/Mapbox/MapBox.vue';
import { type Map } from 'mapbox-gl'

import { addControls } from './controls';
import { useMapCenterManagement } from './useMapCenterManagement'
import { useBuildingMarker } from './useBuildingMarker'
import { useMapboxControlNudge } from './useMapboxControlNudge';
import { useTrackPositioning } from './useTrackPositioning'
import { useMapLayers } from './useMapLayers'
import { useAdminstrativeBoundaries } from '@/components/Mapbox/useAdministrativeBoundries';
import { useBuildingCluster } from '@/components/Mapbox/useBuildingCluster'

import { useMapCenterRouting } from '@/router/mapCenterRouting';

import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';
import { useMetadataStore } from '@/store/metadata';

const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { hasSelectedBuilding } = storeToRefs(useBuildingStore())
const metadataStore = useMetadataStore()
const { isAvailable: hasUserMetaData, metadata: userMetadata } = storeToRefs(metadataStore)

const emit = defineEmits<{ ready: [] }>()

// The Mapbox Map instance
const mapInstance = shallowRef<Map | null>(null)

// Composables to handle map related functionality
const MapCenterManagement = useMapCenterManagement()

useBuildingMarker(mapInstance)
useAdminstrativeBoundaries(mapInstance)
useBuildingCluster(mapInstance)
useMapLayers(mapInstance)
const { getLastKnownPositioning } = useTrackPositioning(mapInstance)


// Update the query string in the route when the map center changes. Navigate to the LngLat from the query string when opening a mapset page
const { getLatLngFromQueryString } = useMapCenterRouting()

// Map Control nudging
const { maybeNudge: maybeNudgeRight } = useMapboxControlNudge('right', 336, hasSelectedBuilding)
const { maybeNudge: maybeNudgeLeft } = useMapboxControlNudge('left', 336, isLeftSidebarOpen)

/**
 * The startup options
 *  Set as ref because options.style is updated once the mapset is available
 *  Reference the last known position from the last visit if available
 */
const options = computed(() => {
  const lastKnownPositioning = getLastKnownPositioning()
  return {
    style: (import.meta.env.VITE_FUNDERMAPS_BASE_STYLE || 'mapbox://styles/laixer/clcz2iorf003414p22imzzhnk'),
    center: getLatLngFromQueryString() || lastKnownPositioning.center || [4.897070, 52.377956], // [5.2913, 52.1326],
    zoom: lastKnownPositioning.zoom || 15,
    pitch: lastKnownPositioning.pitch || 30,
    bearing: lastKnownPositioning.bearing || 0,
    antialias: true,
    fadeDuration: 0,
    attributionControl: false,
  }
})


const onLoad = function onLoad({ map }: { map: Map }) {
  
  mapInstance.value = map

  MapCenterManagement.attachMap(map)

  // Controls & control positioning nudges if sidebars are open
  addControls(map)
  maybeNudgeRight()
  maybeNudgeLeft()

  emit('ready')
}

/**
 * After login, the metadata store refetches and the user's saved
 * lastCenterPosition / zoom / pitch / bearing are reloaded — but the map
 * was already mounted with the pre-login values, so we re-center it here.
 * Only fires when the *center* changes from non-empty to a different value
 * (avoids fighting our own moveend writes during normal panning).
 */
let lastAppliedCenterKey: string | null = null
watch(
  () => userMetadata.value?.lastCenterPosition as { lng: number; lat: number } | undefined,
  (center) => {
    if (!mapInstance.value || !center) return
    const key = `${center.lng},${center.lat}`
    if (key === lastAppliedCenterKey) return
    lastAppliedCenterKey = key
    mapInstance.value.jumpTo({
      center: [center.lng, center.lat],
      zoom: parseFloat(userMetadata.value?.lastZoomLevel as string) || mapInstance.value.getZoom(),
      pitch: parseFloat(userMetadata.value?.lastPitchDegree as string) || mapInstance.value.getPitch(),
      bearing: parseFloat(userMetadata.value?.lastRotation as string) || mapInstance.value.getBearing(),
    })
  },
)

/**
 * Cleanup event handlers
 */
onBeforeUnmount(() => {
  MapCenterManagement.disconnect()
})

</script>

<template>
  <MapBox 
    v-if="hasUserMetaData"
    :options="options" 
    @load="onLoad" />
</template>