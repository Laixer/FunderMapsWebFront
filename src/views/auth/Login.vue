<script setup lang="ts">
import { onMounted } from 'vue'

import { loginRedirect } from '@/services/auth'

// Login lives at the auth app (auth.fundermaps.com). The route's beforeEnter
// already navigates there; this is a no-render fallback.
onMounted(() => {
  loginRedirect(window.location.origin + '/')
})
</script>

<template>
  <div />
</template>
