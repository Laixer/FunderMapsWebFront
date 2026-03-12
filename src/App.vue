<script setup lang="ts">
import { onBeforeMount, watch } from 'vue';
import { useSessionStore } from '@/store/session';
import { useMetadataStore } from '@/store/metadata'
import { storeToRefs } from 'pinia';

const sessionStore = useSessionStore()
const { retrieve: retrieveUserMetaData } = useMetadataStore()
const { isAuthenticated } = storeToRefs(sessionStore)

sessionStore.authenticateFromAccessToken()

onBeforeMount(async () => {
  await retrieveUserMetaData()
})

watch(
  () => isAuthenticated.value,
  (authenticated) => {
    if (authenticated) {
      sessionStore.startTokenRefreshInterval()
    } else {
      sessionStore.stopTokenRefreshInterval()
    }
  },
  { immediate: true }
)

</script>

<template>
  <router-view />
</template>
