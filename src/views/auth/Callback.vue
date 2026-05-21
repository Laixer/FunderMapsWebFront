<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { exchangeCode } from '@/services/oidc'
import { useSessionStore } from '@/store/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const error = ref(false)

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state
  if (typeof code !== 'string') {
    error.value = true
    return
  }
  try {
    await exchangeCode(code, typeof state === 'string' ? state : '')
    await sessionStore.authenticateFromAccessToken()
    router.replace({ name: 'home' })
  } catch (e) {
    console.error('OIDC callback failed:', e)
    error.value = true
  }
})
</script>

<template>
  <!-- Neutral loading during the code exchange — not the login chrome. -->
  <div class="grid min-h-screen place-content-center text-grey-700">
    <p v-if="error" class="text-sm">
      Inloggen mislukt.
      <RouterLink :to="{ name: 'login' }" class="text-green-700 underline">Opnieuw proberen</RouterLink>
    </p>
    <p v-else class="text-sm">Bezig met inloggen…</p>
  </div>
</template>
