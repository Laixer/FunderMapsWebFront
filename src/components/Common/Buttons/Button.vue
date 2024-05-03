
<script setup lang="ts">
import { computed } from 'vue';

/**
 * This is the basic button.
 *  It has slots that can be used to add an icon before or after the label
 *  It has various styling toggles, which should not be used together. 
 */

const { link, outline, muted } = defineProps({
  label: { type: String, default: 'Button' },
  disabled: { type: Boolean, default: false },
  link: { type: Boolean, default: false },
  outline: { type: Boolean, default: false },
  muted: { type: Boolean, default: false }
})


const btnClass = computed<string[]>(() => {

  // Link & outline & muted are mutually exclusive
  if (link) {
    return [ "button-link" ]
  }

  // Link & outline & muted are mutually exclusive
  else if (outline) {
    return [ "button--outline", "group" ]
  }

  // Link & outline & muted are mutually exclusive
  else if (muted) {
    return [
      "button--solid",
      "bg-grey-700",
      "hover:bg-red-500", // TODO: Should this hover color be a prop? 
      "group"
    ]
  }

  // Basic primary button 
  return [ "button--solid", "group" ]
})
</script>

<template>
  <button class="button" :class="btnClass" :disabled="disabled">
    <slot name="before" />
    <span class="button__label">{{ label }}</span>
    <slot name="after" />
  </button>
</template>

