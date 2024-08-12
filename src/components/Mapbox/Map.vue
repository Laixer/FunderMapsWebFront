<script setup lang="ts">
import { type ComputedRef, type Ref, computed, onBeforeUnmount, ref, watch } from 'vue'; 
import { storeToRefs } from 'pinia';

import MapBox from '@/components/Common/Mapbox/MapBox.vue';
import { type Map } from 'mapbox-gl'

import { addControls } from './controls';
import { useEvents } from './useEvents'
import { useLayerVisibility } from './useLayerVisibility'
import { useGeographyFilter } from './useGeographyFilter'
import { useMapsetStyle } from './useMapsetStyle'
import { useMapCenterManagement } from './useMapCenterManagement'
import { useBuildingMarker } from './useBuildingMarker'
import { useMapboxControlNudge } from './useMapboxControlNudge';
import { useTileServerTest } from './useTileServerTest'

import { 
  getLastKnownPositioning, 
  startTrackingPositioning, 
  stopTrackingPositioning 
} from './trackpositioning';
import { useMapCenterRouting } from '@/router/mapCenterRouting';

import { useMapsetStore } from '@/store/mapsets';
import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';
import { useMetadataStore } from '@/store/metadata';

const { activeMapset } = storeToRefs( useMapsetStore() )
const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { hasSelectedBuilding } = storeToRefs(useBuildingStore())
const { isAvailable: hasUserMetaData } = storeToRefs(useMetadataStore())

const emit = defineEmits(['ready'])

// The Mapbox Map instance
let mapInstance: Ref<Map|null> = ref(null)

// Whether the initial map style has been set
const hasSetInitialStyle = ref(localStorage.getItem('TILESERVERTEST') === 'TRUE')


// Composables to handle map related functionality
const MapsetStyle = useMapsetStyle()
const MapCenterManagement = useMapCenterManagement()

useEvents(mapInstance)
useLayerVisibility(mapInstance)
useGeographyFilter(mapInstance)
useBuildingMarker(mapInstance)

useTileServerTest(
  mapInstance, 
  'incident-source', 
  {
    type: 'vector',
    tiles: [import.meta.env.VITE_FUNDERMAPS_TILES_URL || ''],
    minzoom: 10,
    maxzoom: 15
  },
  {
    id: 'incident-layer',
    source: 'incident-source',
    type: 'fill',
    'source-layer': 'analysis_building',
    paint: {
      'fill-color': 'rgba(0, 0, 255, 1.0)'
    }
  }
)


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

const mapStyle: Ref<string|undefined> = ref((hasSetInitialStyle.value ? 'mapbox://styles/mapbox/standard' : undefined)) // default style)
const options: ComputedRef<object> = computed(() => {
  const lastKnownPositioning = getLastKnownPositioning()
  return {
    style: mapStyle.value,
    center: getLatLngFromQueryString() || lastKnownPositioning.center || [4.897070, 52.377956], // [5.2913, 52.1326],
    zoom: lastKnownPositioning.zoom || 15,
    pitch: lastKnownPositioning.pitch || 45,
    bearing: lastKnownPositioning.bearing || 0,
    antialias: true,
    attributionControl: false,
  }
})

console.log("MAPBOX OPTIONS", options.value)

/**
 * Whenever the mapset changes for the first time, set the options.style
 *  This is relevant for loading the right style if it switches early
 */
watch(() => activeMapset.value, (mapset) => {
  if (
    hasSetInitialStyle.value === false 
    && ! mapInstance.value 
    && mapset?.style !== undefined
  ) {
    mapStyle.value = mapset?.style

    setTimeout(() => {
      hasSetInitialStyle.value = true
    }, 200)
  }
}, { once: true })

const onLoad = function onLoad({ map }: { map: Map }) {
  
  mapInstance.value = map

  MapsetStyle?.attachMap(map)
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
  
  MapsetStyle?.disconnect()
  MapCenterManagement.disconnect()
})

</script>

<template>
  <MapBox 
    v-if="hasSetInitialStyle && hasUserMetaData"
    :options="options" 
    @load="onLoad" />
</template>