<script setup lang="ts">
  import Button from './Button.vue';

  const props = defineProps<{
    label?: string
    disabled?: boolean
  }>()

</script>

<template>
  <Button v-bind="props" :outline="true"></Button>
</template>