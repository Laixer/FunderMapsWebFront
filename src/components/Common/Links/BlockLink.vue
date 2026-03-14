<script setup lang="ts">
defineProps<{
  title: string
  label: string
}>()

const emit = defineEmits<{ click: [] }>()

</script>

<template>
  <div
    class="link link--outline | group px-4 py-3"
    @click="emit('click')">
    <div>
      <h6 class="heading-6 ">{{ title }}</h6>
      <div class="link">
        <span class="font-semibold">{{ label }}</span>
      </div>
    </div>
  </div>
</template>