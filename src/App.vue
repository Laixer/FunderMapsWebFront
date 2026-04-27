<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSessionStore } from '@/store/session';
import { useMetadataStore } from '@/store/metadata'

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
</script>

<template>
  <router-view />
</template>
