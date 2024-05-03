<script setup lang="ts">
  import Button from './Button.vue';

  const props = defineProps({
    label: { type: String, default: 'Button' },
    disabled: { type: Boolean, default: false }
  })

</script>

<template>
  <Button v-bind="props" :muted="true"></Button>
</template>