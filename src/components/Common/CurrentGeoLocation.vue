<script setup lang="ts">

import IconButton from '@/components/Common/Buttons/IconButton.vue';
import TargetIcon from '@assets/svg/icons/target.svg'


const emit = defineEmits<{
  coordinates: [lat: number, lon: number],
  error: [ code: number ]
}>()

/**
 * Check whether the browser & device has geolocation support
 */
const hasGeolocationSupport = "geolocation" in navigator

// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#options
const positionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
}


const handleSuccess = function handleSuccess(position: GeolocationPosition) {
  emit(
    'coordinates', 
    position.coords.latitude, 
    position.coords.longitude
  )
}

const handleError = function handleError(err: GeolocationPositionError) {
  console.log(err)
  emit(
    'error',
    err.code
  )
}

/**
 * Obtain the current location of the user
 */
const handleGetCurrentLocation = function handleGetCurrentLocation() {
  navigator.geolocation.getCurrentPosition(
    handleSuccess,
    handleError,
    positionOptions
  )
}

</script>
<template>
  <IconButton 
    v-if="hasGeolocationSupport"
    class="p-3" 
    square 
    label="Reset to my location"
    @click.prevent="handleGetCurrentLocation">
    <TargetIcon 
      class="h-4 w-4"
      aria-hidden="true" />
  </IconButton>
</template>