<script setup lang="ts">

import { computed } from 'vue'

const { square, transparent } = defineProps({
  label: { type: String, default: 'Button' },
  square: { type: Boolean, default: false },
  transparent: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

const btnClass = computed<string[]>(() => {
  if (transparent) {
    return []
  }
  return square ? [
    "button",
    "button--square"
  ] : [
    "button",
    "button--solid", 
    "button--icon"
  ]
})

</script>

<template>
  <button :class="btnClass" :disabled="disabled">
    <!-- <svg class="w-4 aspect-square" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    </svg> -->
    <slot />
    <span class="sr-only">{{ label }}</span>
  </button>
</template>
