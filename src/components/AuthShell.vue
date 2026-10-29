<script setup lang="ts">
// The brand shell of the login pages (moved from FunderMapsAuth, 2026-10-29): full-bleed background, logo top-left
// (back to the map), the page's card centered. Below `lg` the card does not fit beside the logo, so the top padding
// keeps it underneath.
import logo from '@assets/svg/fundermaps-inverted.svg?url'
</script>

<template>
  <div class="page-no-session relative grid min-h-screen place-content-center px-6 pt-24 pb-6 lg:p-6">
    <RouterLink to="/" class="absolute top-8 left-8 rounded focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:outline-none">
      <img :src="logo" alt="FunderMaps, terug naar de kaart" class="h-8 sm:h-9" />
    </RouterLink>
    <slot />
  </div>
</template>
