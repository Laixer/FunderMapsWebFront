<script setup lang="ts">
import { computed, ComputedRef, ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { storeToRefs } from 'pinia';

import { useBuildingStore } from '@/store/buildings.ts';
import Icon from '@/components/Common/Icons/Icon.vue';

const { buildingId } = storeToRefs(useBuildingStore())

const copySource = ref('')
const { copy, isSupported, copied } = useClipboard({ source: copySource })

const buildingIdTitle: ComputedRef<{top: string, bottom: string}|null> = computed(
  () => {
    if (buildingId.value === null) return null
    const segments = buildingId.value.split('.')
    const number = segments[segments.length - 1]
    delete segments[segments.length - 1]

    return { top: segments.join('.') || '', bottom: number }
  }
)

watch(
  () => buildingId.value,
  async (buildingId) => {
    if (buildingId === null) return

    copySource.value = buildingId
  },
  { immediate: true }
)

</script>


<template>
  <div 
    v-if="buildingIdTitle"
    class="sidebar__heading flex items-center justify-between gap-3">
    <h4 class="heading-4">
      {{ buildingIdTitle.bottom }} 
      <br v-if="buildingIdTitle.top"/> 
      <sub>{{ buildingIdTitle.top }}</sub>
    </h4>

    <button v-if="isSupported" @click="copy(copySource)">
      <Transition mode="out-in">
        <Icon v-if="! copied" name="clipboard-regular" />
        <Icon v-else name="check" />
      </Transition>
    </button>
  </div>
</template>


<style>
.sidebar .sidebar__heading h4 {
  position: relative;
  font-size: clamp(1rem, 1rem + 1.0458vw, 1.5rem);
}
.sidebar .sidebar__heading h4 sub {
  position: absolute;
  color: rgb(127 143 164 / var(--tw-text-opacity, 1));
  font-size: clamp(0.5rem, 0.5rem + 0.5229vw, 1rem);
}
.sidebar .sidebar__heading button {
  padding: 4px
}
.sidebar .sidebar__heading svg {
  width: 16px;
}
.sidebar .sidebar__heading button:hover svg {
  fill: rgb(40,204,139)
}
</style>