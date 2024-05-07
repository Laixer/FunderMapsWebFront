<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import MapBox from '../Common/Mapbox/MapBox.vue';
import mapboxgl, { type Map } from 'mapbox-gl'

import { addControls } from './controls';
import {
  startWatchingForMapsetChanges,
  stopWatchingMapsetChanges
} from './mapset'
import { 
  getLastKnownPositioning, 
  startTrackingPositioning, 
  stopTrackingPositioning 
} from './trackpositioning';


import { useMainStore } from '@/store/main';
import { useMapsetStore } from '@/store/mapsets';
const { mapCenterLatLon } = storeToRefs( useMainStore() )
const { activeMapset } = storeToRefs( useMapsetStore() ) // activeMapsetId, 

const emit = defineEmits(['ready'])

let mapInstance: Map|null = null

const hasSetInitialStyle = ref(false)

// A flag we use to track when center changes should be ignored
let ignoreCenterChange: boolean = true

/**
 * The startup options
 *  Set as ref because options.style is updated once the mapset is available
 *  Reference the last known position from the last visit if available
 */
const lastKnownPositioning = getLastKnownPositioning()
let options = ref({
  style: <string|undefined> undefined,
  center: lastKnownPositioning.center || [5.2913, 52.1326],
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

  // Watch map movement
  map.on('moveend', handleMapMovement)
  handleMapMovement()

  startWatchingForMapsetChanges(map)

  addControls(map)

  startTrackingPositioning(map)

  emit('ready')
}

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
 * Fly to a location the mapcenter value is changed
 */
watch(
  () => mapCenterLatLon.value,
  (center: mapboxgl.LngLat|null) => {

    // We ignore changes caused by `handleMapMovement`
    if (! mapInstance || center === null || ignoreCenterChange === true) {
      return
    }

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
)

/**
 * Cleanup even handlers
 */
onBeforeUnmount(() => {
  stopTrackingPositioning()
  stopWatchingMapsetChanges()
})

</script>

<template>
  <MapBox 
    v-if="hasSetInitialStyle"
    :options="options" 
    @load="onLoad" />
</template>