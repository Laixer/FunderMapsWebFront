<script setup lang="ts">
  import IconButton from './IconButton.vue';

  const props = defineProps({
    label: { type: String, default: 'Button' },
    disabled: { type: Boolean, default: false }
  })
</script>

<template>
  <IconButton v-bind="props" :square="true"></IconButton>
</template>