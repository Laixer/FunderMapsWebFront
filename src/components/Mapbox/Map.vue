<script setup lang="ts">
import { WatchStopHandle, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import MapBox from '../Common/Mapbox/MapBox.vue';
import { type Map } from 'mapbox-gl'

import { addControls } from './controls';
import { useEvents } from './useEvents'
import { useLayerVisibility } from './useLayerVisibility'
import { useMunicipalityFilter } from './useMunicipalityFilter'
import { useMapsetStyle } from './useMapsetStyle'
import { useMapCenterManagement } from './useMapCenterManagement'
import { useBuildingMarker } from './marker'
import { useMapboxControlNudge } from './useMapboxControlNudge';

import { 
  getLastKnownPositioning, 
  startTrackingPositioning, 
  stopTrackingPositioning 
} from './trackpositioning';

import { useMapsetStore } from '@/store/mapsets';
import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';
import { useMapCenterRouting } from '@/router/mapCenterRouting';
const { activeMapset } = storeToRefs( useMapsetStore() )
const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { hasSelectedBuilding } = storeToRefs(useBuildingStore())

const emit = defineEmits(['ready'])

// The Mapbox Map instance
let mapInstance: Map|null = null

// Handle to stop the watcher that positions the building pin
let buildingMarkerWatchStopHandle: WatchStopHandle|null = null

// Whether the initial map style has been set
const hasSetInitialStyle = ref(false)


// Composables to handle map related functionality
const MapEvents = useEvents()
const LayerVisibility = useLayerVisibility()
const MunicipalityFilter = useMunicipalityFilter()
const MapsetStyle = useMapsetStyle()
const MapCenterManagement = useMapCenterManagement()

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
const lastKnownPositioning = getLastKnownPositioning()
let options = ref({
  style: <string|undefined> undefined,
  center: lastKnownPositioning.center || getLatLngFromQueryString() || [5.2913, 52.1326],
  zoom: lastKnownPositioning.zoom || 15,
  pitch: lastKnownPositioning.pitch || 45,
  bearing: lastKnownPositioning.bearing || 0,
  antialias: true,
  attributionControl: false,
})

/**
 * Whenever the mapset changes for the first time, set the options.style
 */
watch(() => activeMapset.value, (mapset) => {
  if (! mapInstance && mapset?.style !== undefined) {
    options.value.style = mapset?.style

    setTimeout(() => {
      hasSetInitialStyle.value = true
    }, 200)
  }
}, { once: true })

const onLoad = function onLoad({ map }: { map: Map }) {
  
  mapInstance = map

  // Attach the building marker
  buildingMarkerWatchStopHandle = useBuildingMarker(map)

  MunicipalityFilter.attachMap(map) 
  MapEvents.attachMap(map)
  LayerVisibility.attachMap(map)
  MapsetStyle.attachMap(map)
  MapCenterManagement.attachMap(map)

  // Controls & control positioning nudges if sidebars are open
  addControls(map)
  maybeNudgeRight()
  maybeNudgeLeft()

  startTrackingPositioning(map)

  emit('ready')
}

/**
 * Cleanup event handlers
 */
onBeforeUnmount(() => {
  stopTrackingPositioning()

  MunicipalityFilter.disconnect()
  MapEvents.disconnect()
  LayerVisibility.disconnect()
  MapsetStyle.disconnect()
  MapCenterManagement.disconnect()

  if (buildingMarkerWatchStopHandle) {
    buildingMarkerWatchStopHandle()
  }
})

</script>

<template>
  <MapBox 
    v-if="hasSetInitialStyle"
    :options="options" 
    @load="onLoad" />
</template>./useMapboxControlNudge