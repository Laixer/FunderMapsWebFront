<script setup lang="ts">
/**
 * This is the wrapper for all login pages
 */
import ColoredLogo from '@/components/Branding/ColoredLogo.vue'

defineProps<{
  title?: string
}>()

</script>

<template>
  <div class="page-no-session | grid place-content-center">
    <ColoredLogo />

    <h1 v-if="title" class="sr-only">
      {{ title }}
    </h1>

    <slot />
  </div>
</template>

<style>
.page-no-session {
  background-image: url("@assets/images/background.jpg")
}
</style>