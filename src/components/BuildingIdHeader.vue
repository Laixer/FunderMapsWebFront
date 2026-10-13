<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBuildingStore } from '@/store/buildings';
import { useGeoLocationsStore } from '@/store/building/geolocations';

const { buildingId } = storeToRefs(useBuildingStore())
const locationStore = useGeoLocationsStore()

/**
 * The location data the panel loads for this pand, once it is there
 */
const location = computed(() => {
  if (buildingId.value === null) return null
  return locationStore.getData(buildingId.value)
})

/**
 * Street and number, and postcode with place for the line under it
 */
const address = computed(() => {
  const street = location.value?.address?.street
  if (! street) return null

  const { buildingNumber, postalCode, city } = location.value.address
  return {
    street: `${street} ${buildingNumber ?? ''}`.trim(),
    place: `${postalCode ?? ''} ${city ?? ''}`.trim()
  }
})

/**
 * The BAG number of the pand.
 *
 * From the location data, not from the id in the address of the page: that
 * is the pand's after a click on the map, but the id of an address
 * (nummeraanduiding) after a search, and the heading showed either as if it
 * were the same number. Until the location data is there the id of the page
 * will do, unless it is plainly that of an address.
 */
const pandNumber = computed(() => {
  if (buildingId.value === null) return null

  const lastSegment = (id: string) => id.split('.').pop() || id

  const pandId = location.value?.building?.externalId
  if (pandId) return lastSegment(pandId)

  const number = lastSegment(buildingId.value)
  const isAddressId = /NUMMERAANDUIDING/i.test(buildingId.value) || /^[0-9]{4}20[0-9]{10}$/.test(number)

  return isAddressId ? null : number
})

</script>


<template>
  <div
    v-if="address || pandNumber"
    class="sidebar__heading">
    <template v-if="address">
      <h4 class="heading-4 break-words">{{ address.street }}</h4>
      <p v-if="address.place" class="mt-1 text-sm text-(--color-text-muted)">{{ address.place }}</p>
      <p v-if="pandNumber" class="font-mono text-sm text-(--color-text-muted)" title="BAG Pand ID">
        <span class="sr-only">BAG Pand ID: </span>{{ pandNumber }}
      </p>
    </template>
    <h4 v-else class="heading-4">{{ pandNumber }}</h4>
  </div>
</template>


<style scoped>
.sidebar .sidebar__heading h4 {
  font-size: clamp(1rem, 1rem + 1.0458vw, 1.5rem);
}
</style>
