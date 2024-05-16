<script setup lang="ts">
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';

defineProps({
  title: { type: String, required: true },
  label: { type: String, required: true }
})

const emit = defineEmits(['click'])

</script>

<template>
  <div
    class="link link--outline | group px-4 py-3"
    @click="emit('click')">
    <div>
      <h6 class="heading-6 ">{{ title }}</h6>
      <div class="link">
        <span class="font-semibold">{{ label }}</span>
        <AnimatedArrowIcon />
      </div>
    </div>
  </div>
</template>