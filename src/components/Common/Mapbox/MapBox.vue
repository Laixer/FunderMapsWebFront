<script setup lang="ts">
/**
 * @copyright MIT
 * @author Wouter van Dam (wouter@journeyworks.nl)
 *
 * This is a basic, generic Vue wrapper component for MapLibre.
 * This module is included in the source code of the application itself for simplicity and reliability
 */

import { onMounted, onUnmounted, provide, readonly, ref } from 'vue'
import { Map as MaplibreMap, setWorkerUrl } from 'maplibre-gl'
// maplibre v6 loads its worker as a sibling module via a runtime-computed
// URL, which the bundler can't see - the file never gets emitted and the
// request falls through to the SPA catch-all (text/html -> dead worker,
// blank map). ?worker&url makes Vite bundle the worker with its imports
// and hands us the hashed URL to register instead.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl)

/**
 * The MapLibre instance
 */
let map: MaplibreMap

/**
 * Reference to the DOM container
 */
const mapcontainer = ref()

/**
 * Used to indicate to child components that the map instance is loaded
 */
const loaded = ref(false)
provide('loaded', readonly(loaded))

/**
 * Props
 */
const {
  mapStyle = '',
  options = {}
} = defineProps<{
  mapStyle?: string,
  options?: object
}>()

const emit = defineEmits<{
  load: [{ map: MaplibreMap }]
}>()

const loadMap = function() {
  map = new MaplibreMap(
    Object.assign({}, options, {
      container: mapcontainer.value,
    },
    // Do not override style from options with an empty string
    mapStyle && mapStyle !== '' ? { style: mapStyle } : {})
  )

  map.on('load', () => {
    loaded.value = true
    emit('load', { map })
  })
}

onMounted(loadMap)

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
/* Unscoped: overrides maplibre-gl.css which sets inline dimensions */
.MapBox,
.maplibregl-map {
  width: 100% !important;
  height: 100% !important;
}
</style>
