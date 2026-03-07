<script setup lang="ts">
import { computed } from 'vue';


const { shadow, rounded, wide } = defineProps({
  title: { type: String, default: null },
  shadow: { type: Boolean, default: false },
  rounded: { type: Boolean, default: false },
  wide: { type: Boolean, default: false }
})

const cardClasses = computed<string[]>(() => {

  let classes = []

  // Link & outline & muted are mutually exclusive
  if (shadow) {
    classes.push('shadow-card')
  }
  if (rounded) {
    classes.push('rounded-lg')
  }
  if (wide) {
    classes.push('w-[calc(100vw-3rem)]', 'sm:w-[30rem]')
  }

  // Basic primary button 
  return classes
})

</script>

<template>
  <div 
    class="card bg-white | grid space-y-6 p-8"
    :class="cardClasses">
    <header v-if="title" class="card__header">
      <h3 class="heading-3">{{ title }}</h3>
    </header>
    <div class="card__content space-y-6">
      <slot></slot>
    </div>
    <footer class="card__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>