<script setup lang="ts">
  import Button from './Button.vue';

  const props = defineProps<{
    label?: string
    disabled?: boolean
  }>()

</script>

<template>
  <!-- The icon slots are passed on (as LinkButton does): without this the
       icons a caller gives never showed -->
  <Button v-bind="props" :outline="true">
    <template v-slot:before>
      <slot name="before" />
    </template>

    <template v-slot:after>
      <slot name="after" />
    </template>
  </Button>
</template>