<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/store/session';
import { useMetadataStore } from '@/store/metadata'
import { onAuthExpired } from '@/services/authEvents'

const router = useRouter()
const sessionStore = useSessionStore()
const metadataStore = useMetadataStore()
const { isAuthenticated } = storeToRefs(sessionStore)

sessionStore.authenticateFromAccessToken()

// Refetch metadata whenever the user becomes authenticated. Covers three
// cases: fresh login (false -> true), session restore on page load
// (false -> true once /me resolves), and re-login after a logout. The
// initial false state for guest users also runs once with `immediate: true`
// so isAvailable flips on for the guest path.
watch(
  isAuthenticated,
  async () => {
    await metadataStore.retrieve()
  },
  { immediate: true }
)

// Single global handler for "the API client says auth is invalid" (missing
// or server-rejected token). Clears session state and lands the user on
// /login so they can sign back in. UserMenu's manual logout doesn't go
// through this path — it intentionally keeps the user on the current page
// (public mapsets remain accessible).
onAuthExpired(async () => {
  await sessionStore.logout()
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login' })
  }
})
</script>

<template>
  <router-view />
</template>
