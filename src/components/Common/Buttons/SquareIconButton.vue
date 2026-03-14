<script setup lang="ts">
  import IconButton from './IconButton.vue';

  const props = defineProps<{
    label?: string
    disabled?: boolean
  }>()
</script>

<template>
  <IconButton v-bind="props" :square="true"></IconButton>
</template>