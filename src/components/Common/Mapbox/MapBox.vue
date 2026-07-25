<script setup lang="ts">
/**
 * @copyright MIT
 * @author Wouter van Dam (wouter@journeyworks.nl)
 *
 * This is a basic, generic Vue wrapper component for MapLibre.
 * This module is included in the source code of the application itself for simplicity and reliability
 */

import { onMounted, onUnmounted, provide, readonly, ref } from 'vue'
import { Map as MaplibreMap } from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css';

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
