<script setup lang="ts">
import { watch } from 'vue';
import { refreshAccessToken } from '@/services/jwt.ts'
import { useSessionStore } from '@/store/session';
import { storeToRefs } from 'pinia';

const sessionStore = useSessionStore()
const { authenticateFromAccessToken } = sessionStore
const { isAuthenticated } = storeToRefs(sessionStore)
let accessTokenRefreshInterval: ReturnType<typeof setTimeout>|null = null

/**
 * Try to continue from the access token if there is one
 */ 
try {
  authenticateFromAccessToken()
  refreshAccessToken()
} catch(e) {
  // no luck, no harm
}

/**
 * When logged in, start refreshing the token.
 *  Stop this when logging out
 */
watch(
  () => isAuthenticated.value,
  (isAuthenticated) => {
    if (isAuthenticated) {
      /**
       * Refresh the jwt access token every 10 minutes
       *  The refresh fn checks for the existance of a token
       */
      accessTokenRefreshInterval = setInterval(() => {
        refreshAccessToken()
      }, 60 * 1000 * 10)
    } else if (accessTokenRefreshInterval !== null) {
      clearInterval(accessTokenRefreshInterval)
      accessTokenRefreshInterval = null
    }
  },
  { immediate: true }
)

</script>

<template>
  <router-view />
</template>


<style>
.page-dashboard {
  max-height: 100vh;
}

/* This applies to all generic Transition elements */
.v-enter-active,
.v-leave-active {
  transition: opacity .5s ease;
}
/* This is for the Transitions named "short" */
.short-enter-active,
.short-leave-active {
  transition: opacity .25s ease;
}
.v-enter-from,
.v-leave-to,
.short-enter-from,
.short-leave-to {
  opacity: 0;
}
</style>