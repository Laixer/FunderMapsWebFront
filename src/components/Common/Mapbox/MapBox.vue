<script setup lang="ts">
/**
 * @copyright MIT 
 * @author Wouter van Dam (wouter@journeyworks.nl)
 * 
 * This is a basic, generic Vue wrapper component for MapBox. 
 * This module is included in the source code of the application itself for simplicity and reliability
 */

import { onMounted, onUnmounted, provide, readonly, ref } from 'vue'
import mapboxgl, { type Map } from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * The Mapbox instance
 */
let map: Map

/**
 * Reference to the DOM container
 */ 
const mapcontainer = ref()

/**
 * Used to indicate to child components that the mapbox instance is loaded
 */
const loaded = ref(false)
provide('loaded', readonly(loaded))

/**
 * Props
 */ 
const { 
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN, 
  mapStyle = import.meta.env.VITE_MAPBOX_STYLE, 
  options = {} 
} = defineProps<{
  accessToken?: string,
  mapStyle?: string,
  options?: object
}>()

const emit = defineEmits<{
  load: [{ map: Map, sdk?: object }]
}>()

/**
 * 
 */
const loadMapbox = function() {
  const mapboxSDK = mapboxgl

  if (accessToken) {
    mapboxSDK.accessToken = accessToken  
  }

  map = new mapboxSDK.Map(
    Object.assign({}, options, {
      container: mapcontainer.value,
    },
    // Do not override style from options with an empty string
    mapStyle && mapStyle !== '' ? { style: mapStyle } : {})
  )

  // provide('map', map)

  map.on('load', () => {
    loaded.value = true
    emit('load', { map, sdk: mapboxSDK } )
  })
}

onMounted(loadMapbox)

onUnmounted(() => {
  map.remove()
})
</script>

<template>
  <div class="MapBox">
    <div ref="mapcontainer"></div>
    <slot v-if="loaded" />
  </div>
</template>

<style>
/* Unscoped: overrides mapbox-gl.css which sets inline dimensions */
.MapBox,
.mapboxgl-map {
  width: 100% !important;
  height: 100% !important;
}
</style>