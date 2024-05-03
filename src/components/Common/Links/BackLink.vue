<script setup lang="ts">

import BackArrowIcon from '@/components/Common/Icons/BackArrowIcon.vue'

defineProps({
  label: { type: String, required: true }
})
</script>

<template>
  <a  
    href="#"
    class="link link--outline | group">
    <BackArrowIcon />
    <strong>{{ label }}</strong>
  </a>
</template>