<script setup lang="ts">
  import Button from './Button.vue';

  const props = defineProps<{
    label?: string
    disabled?: boolean
  }>()

</script>

<template>
  <Button v-bind="props" :link="true">
    <template v-slot:before>
      <slot name="before" />
    </template>

    <template v-slot:after>
      <slot name="after" />
    </template>
  </Button>
</template>