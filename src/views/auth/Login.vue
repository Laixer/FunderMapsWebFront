<script setup lang="ts">
import { onMounted } from 'vue'

import { loginRedirect } from '@/services/oidc'

// Login lives in the auth app (auth.fundermaps.com). The router redirects to the
// OIDC flow before this renders (the login route's beforeEnter); this is a
// no-render fallback so the old login form never flashes during the hand-off.
onMounted(() => {
  loginRedirect()
})
</script>

<template>
  <div />
</template>
