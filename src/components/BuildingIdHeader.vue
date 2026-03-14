<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBuildingStore } from '@/store/buildings';

const { buildingId } = storeToRefs(useBuildingStore())

const buildingIdTitle = computed(() => {
  if (buildingId.value === null) return null
  const segments = buildingId.value.split('.')
  const number = segments[segments.length - 1]

  return { top: segments.slice(0, -1).join('.') || '', bottom: number }
})

</script>


<template>
  <div
    v-if="buildingIdTitle"
    class="sidebar__heading flex items-center justify-between gap-3">
    <h4 class="heading-4">{{ buildingIdTitle.bottom }}</h4>
  </div>
</template>


<style scoped>
.sidebar .sidebar__heading h4 {
  font-size: clamp(1rem, 1rem + 1.0458vw, 1.5rem);
}
</style>
