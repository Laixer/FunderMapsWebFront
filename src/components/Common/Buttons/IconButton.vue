<script setup lang="ts">

import { computed } from 'vue'

const { square, transparent } = defineProps<{
  label?: string
  square?: boolean
  transparent?: boolean
  disabled?: boolean
}>()

// The template gives the button type="button"; a caller can still pass another
// type. Without one a button is the submit button of the form it sits in: the
// search field's "Wissen" was, so Enter emptied the field.
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
  <button type="button" :class="btnClass" :disabled="disabled">
    <!-- <svg class="w-4 aspect-square" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    </svg> -->
    <slot />
    <span class="sr-only">{{ label }}</span>
  </button>
</template>
