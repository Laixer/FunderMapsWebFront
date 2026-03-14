<script setup lang="ts">

import { computed } from 'vue'

const { name = 'A. Noniempje', color = 'blue' } = defineProps<{
  name?: string
  color?: string
}>()

const firstLetter = computed<string>(() => {
  return name.charAt(0)
})

const colorClasses = computed<string[]>(() => {
  const selected = color

  if (selected === 'blue') {
    return [
      `group-hover:bg-blue-500`,
      `bg-blue-900`
    ]
  }
  if (selected === 'green') {
    return [
      `group-hover:bg-green-500`,
      `bg-green-700`
    ]
  }
  if (selected === 'yellow') {
    return [
      `group-hover:bg-yellow-100`,
      `bg-yellow-500`
    ]
  }

  return [
    `group-hover:bg-grey-400`,
    `bg-grey-800`
  ]
})

</script>

<template>
  <div class="avatar | text-white" :class="colorClasses">
    <strong aria-hidden="true">{{ firstLetter }}</strong>
    <span class="sr-only">{{ name }}</span>
  </div>
</template>