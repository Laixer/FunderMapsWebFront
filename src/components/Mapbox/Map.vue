<script setup lang="ts">
import { type ComputedRef, type Ref, computed, onBeforeUnmount, ref } from 'vue'; 
import { storeToRefs } from 'pinia';

import MapBox from '@/components/Common/Mapbox/MapBox.vue';
import { type Map } from 'mapbox-gl'

import { addControls } from './controls';
import { useMapCenterManagement } from './useMapCenterManagement'
import { useBuildingMarker } from './useBuildingMarker'
import { useMapboxControlNudge } from './useMapboxControlNudge';
import { useTrackPositioning } from './useTrackPositioning'
import { useMapLayers } from './useMapLayers'

import { useMapCenterRouting } from '@/router/mapCenterRouting';

import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';
import { useMetadataStore } from '@/store/metadata';

const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { hasSelectedBuilding } = storeToRefs(useBuildingStore())
const { isAvailable: hasUserMetaData } = storeToRefs(useMetadataStore())

const emit = defineEmits(['ready'])

// The Mapbox Map instance
let mapInstance: Ref<Map|null> = ref(null)

// Composables to handle map related functionality
const MapCenterManagement = useMapCenterManagement()

useBuildingMarker(mapInstance)
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
const options: ComputedRef<object> = computed(() => {
  const lastKnownPositioning = getLastKnownPositioning()
  return {
    style: (import.meta.env.VITE_FUNDERMAPS_BASE_STYLE || 'mapbox://styles/laixer/clcz2iorf003414p22imzzhnk'),
    center: getLatLngFromQueryString() || lastKnownPositioning.center || [4.897070, 52.377956], // [5.2913, 52.1326],
    zoom: lastKnownPositioning.zoom || 15,
    pitch: lastKnownPositioning.pitch || 45,
    bearing: lastKnownPositioning.bearing || 0,
    antialias: true,
    attributionControl: false,
  }
})

console.log("MAPBOX OPTIONS", options.value)

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