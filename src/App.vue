<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useSessionStore } from '@/store/session';
import { useMetadataStore } from '@/store/metadata'

const sessionStore = useSessionStore()
const { retrieve: retrieveUserMetaData } = useMetadataStore()

sessionStore.authenticateFromAccessToken()

onBeforeMount(async () => {
  await retrieveUserMetaData()
})

</script>

<template>
  <router-view />
</template>
