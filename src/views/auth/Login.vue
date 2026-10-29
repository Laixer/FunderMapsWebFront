<script setup lang="ts">
// The map's own login page (moved from FunderMapsAuth, auth.fundermaps.com, 2026-10-29): e-mail + password, or a
// passkey (also offered in the e-mail field's autocomplete). Afterwards the visitor goes back to where they came from.
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import AuthShell from '@/components/AuthShell.vue'
import PasskeyIcon from '@assets/svg/icons/passkey.svg'
import { login, loginWithPasskey, safeRedirect } from '@/services/auth'
import { holdFocus } from '@/utils/focus'

const route = useRoute()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const passkeyBusy = ref(false)
// `expired`: the account page sent the visitor here because the API wanted a new login.
const error = ref<string | null>(route.query.expired === '1' ? 'Je sessie is verlopen. Log opnieuw in.' : null)

/**
 * Where to go once the cookie is set: `redirect` (this map, or another FunderMaps app), else the map. A full page
 * load, so the map starts with the session. Settles when this page is left (at most 10 s): until then the button that
 * was pressed stays busy.
 */
async function continueAfterLogin() {
  const params = new URLSearchParams(window.location.search)
  const target = safeRedirect(params.get('redirect')) ?? `${window.location.origin}/`
  // pagehide, not unload: the browser may keep this page for its Back button, and the form must be idle when it
  // comes back. The time limit: a load stopped with Esc fires no pagehide, and must not leave it busy.
  const leaving = new Promise((resolve) => window.addEventListener('pagehide', resolve, { once: true }))
  window.location.assign(target)
  await Promise.race([leaving, new Promise((resolve) => setTimeout(resolve, 10_000))])
}

async function onSubmit() {
  if (submitting.value) return
  const giveFocusBack = holdFocus()
  submitting.value = true
  // The red box stays while the button says "Bezig…": removing it would make the form jump at every new try.
  try {
    await login(email.value, password.value)
    error.value = null
    await continueAfterLogin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Inloggen mislukt.'
  } finally {
    submitting.value = false
    await giveFocusBack()
  }
}

async function onPasskey() {
  if (passkeyBusy.value) return
  const giveFocusBack = holdFocus()
  passkeyBusy.value = true
  // As above, the red box stays until the answer: a dismissed prompt clears it.
  try {
    const signedIn = await loginWithPasskey()
    error.value = null
    if (signedIn) await continueAfterLogin()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Inloggen met passkey mislukt.'
  } finally {
    passkeyBusy.value = false
    await giveFocusBack()
  }
}

const passkeysSupported = ref(false)

onMounted(async () => {
  passkeysSupported.value = typeof window.PublicKeyCredential !== 'undefined'
  if (!passkeysSupported.value) return
  // Conditional UI: the browser lists the user's passkeys for this site in the e-mail field's autocomplete
  // (autocomplete="username webauthn"). Resolves only when one is picked; a password submit simply supersedes it.
  try {
    const available = await window.PublicKeyCredential.isConditionalMediationAvailable?.()
    if (available && (await loginWithPasskey({ autoFill: true }))) continueAfterLogin()
  } catch {
    // no conditional UI, or the user went on with a password
  }
})
</script>

<template>
  <AuthShell>
    <form class="w-[calc(100vw-3rem)] sm:w-[30rem] space-y-6 rounded-xl bg-white p-8 shadow-card" @submit.prevent="onSubmit">
      <header class="space-y-1">
        <h1 class="text-2xl font-extrabold text-blue-900">Inloggen</h1>
        <p class="text-sm text-grey-700">Welkom terug bij FunderMaps.</p>
      </header>

      <p
        v-if="error"
        class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500"
        role="alert"
      >
        {{ error }}
      </p>

      <div class="space-y-4">
        <label class="block">
          <span class="mb-1 block text-sm font-medium text-grey-800">E-mailadres</span>
          <input
            v-model="email"
            type="email"
            autocomplete="username webauthn"
            required
            placeholder="naam@bedrijf.nl"
            class="w-full rounded-lg border border-grey-400 px-3 py-2.5 text-sm transition-colors placeholder:text-grey-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none"
          />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-medium text-grey-800">Wachtwoord</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="w-full rounded-lg border border-grey-400 px-3 py-2.5 text-sm transition-colors placeholder:text-grey-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="flex w-full items-center justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors enabled:hover:bg-green-700 focus:ring-2 focus:ring-green-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ submitting ? 'Bezig…' : 'Inloggen' }}
      </button>

      <button
        v-if="passkeysSupported"
        type="button"
        :disabled="passkeyBusy"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-grey-400 px-4 py-2.5 text-sm font-semibold text-grey-800 transition-colors enabled:hover:border-green-500 enabled:hover:text-green-700 focus:ring-2 focus:ring-green-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        @click="onPasskey"
      >
        <PasskeyIcon class="h-4 w-4" aria-hidden="true" />
        {{ passkeyBusy ? 'Bezig…' : 'Inloggen met passkey' }}
      </button>

      <RouterLink
        :to="{ name: 'forgot-password', query: { redirect: route.query.redirect } }"
        class="mx-auto block w-fit rounded text-center text-sm text-green-700 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:outline-none"
      >
        Wachtwoord vergeten?
      </RouterLink>
    </form>
  </AuthShell>
</template>
