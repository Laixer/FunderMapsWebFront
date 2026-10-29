<script setup lang="ts">
// Account: who is logged in, their passkeys (add, remove), and sign-out. Moved from FunderMapsAuth's home page on
// 2026-10-29, without its list of FunderMaps apps: here the way on is the map. Only reached with a session (router).
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthShell from '@/components/AuthShell.vue'
import {
  addPasskey,
  deletePasskey,
  getSession,
  listPasskeys,
  SessionExpiredError,
  signOut,
  type Passkey,
  type SessionUser,
} from '@/services/auth'
import { holdFocus } from '@/utils/focus'

const router = useRouter()

const user = ref<SessionUser | null>(null)
const loading = ref(true)
const passkeys = ref<Passkey[]>([])
// False until the list has been read: "none yet" is only true when we know.
const passkeysLoaded = ref(false)
const passkeyError = ref<string | null>(null)
const signOutFailed = ref(false)
const signingOut = ref(false)
const busy = ref(false)
const passkeysSupported = typeof window !== 'undefined' && typeof window.PublicKeyCredential !== 'undefined'

/**
 * When the API wants a new login, that is said on the login page, not as an error here; it brings the visitor back
 * here afterwards. The errors that do stay here are our own Dutch ones: the API's are English.
 */
function toLoginIfExpired(e: unknown): boolean {
  if (!(e instanceof SessionExpiredError)) return false
  router.push({ name: 'login', query: { expired: '1', redirect: '/account' } })
  return true
}

async function refreshPasskeys() {
  try {
    passkeys.value = await listPasskeys()
    passkeysLoaded.value = true
  } catch (e) {
    passkeysLoaded.value = false
    if (!toLoginIfExpired(e)) passkeyError.value = 'Passkeys ophalen mislukt.'
  }
}

onMounted(async () => {
  const session = await getSession()
  if (!session) {
    router.push({ name: 'login', query: { redirect: '/account' } })
    return
  }
  user.value = session.user
  // "Laden…" until the list is in too: the centred card grew when it arrived, and everything on it jumped. At most
  // 3 s: a list that hangs must not keep the page, and "Uitloggen", away; it fills in when it comes.
  if (passkeysSupported) await Promise.race([refreshPasskeys(), new Promise((r) => setTimeout(r, 3000))])
  loading.value = false
})

function defaultPasskeyName(): string {
  const ua = navigator.userAgent
  if (/iPhone|iPad/.test(ua)) return 'iPhone of iPad'
  if (/Macintosh/.test(ua)) return 'Mac'
  if (/Android/.test(ua)) return 'Android-toestel'
  if (/Windows/.test(ua)) return 'Windows-pc'
  return 'Dit apparaat'
}

async function onAddPasskey() {
  if (busy.value) return
  // Before the prompt, which has the focus while it is open.
  const giveFocusBack = holdFocus()
  const name = window.prompt('Naam voor deze passkey', defaultPasskeyName())
  if (name === null) return
  busy.value = true
  // The red box stays until the answer, here, on delete and on sign-out: removing it at the press would make the
  // card jump at every new try.
  try {
    await addPasskey(name.trim() || defaultPasskeyName())
    passkeyError.value = null
    await refreshPasskeys()
  } catch (e) {
    if (toLoginIfExpired(e)) return
    const what = e instanceof Error ? `${e.name} ${e.message}` : ''
    // Dismissing the browser prompt is not an error: it clears an old one. Chrome reports a dismissal or a time-out
    // in words ("…timed out or was not allowed"), without the name NotAllowedError.
    passkeyError.value = /abort|cancel|not ?allowed/i.test(what) ? null : 'Passkey toevoegen mislukt.'
  } finally {
    busy.value = false
    await giveFocusBack()
  }
}

async function onDeletePasskey(pk: Passkey) {
  if (busy.value) return
  const giveFocusBack = holdFocus()
  if (!window.confirm(pk.name ? `Passkey "${pk.name}" verwijderen?` : 'Deze passkey verwijderen?')) return
  busy.value = true
  try {
    await deletePasskey(pk.id)
    passkeyError.value = null
    await refreshPasskeys()
  } catch (e) {
    if (!toLoginIfExpired(e)) passkeyError.value = 'Passkey verwijderen mislukt.'
  } finally {
    busy.value = false
    await giveFocusBack()
  }
}

function formatDate(d: Passkey['createdAt']): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function onSignOut() {
  if (signingOut.value) return
  const giveFocusBack = holdFocus()
  signingOut.value = true
  const ok = await signOut()
  signOutFailed.value = !ok
  // Signed out: the map, as a guest (a full load, so nothing of the session stays). Still logged in after a
  // failure: stay, and say so.
  if (ok) {
    window.location.assign(`${window.location.origin}/`)
    return
  }
  signingOut.value = false
  await giveFocusBack()
}
</script>

<template>
  <AuthShell>
    <div class="w-[calc(100vw-3rem)] sm:w-[30rem] space-y-6 rounded-xl bg-white p-8 shadow-card">
      <p v-if="loading" class="text-sm text-grey-700">Laden…</p>
      <template v-else>
        <header class="space-y-1">
          <h1 class="text-2xl font-extrabold text-blue-900">Account</h1>
          <p class="text-sm text-grey-700">Je bent ingelogd bij FunderMaps als <span class="font-medium text-grey-800">{{ user?.email }}</span>.</p>
        </header>

        <section v-if="passkeysSupported" class="space-y-2">
          <div class="flex items-baseline justify-between">
            <h2 class="text-xs font-semibold uppercase tracking-wide text-grey-700">Passkeys</h2>
            <button
              type="button"
              :disabled="busy"
              class="rounded text-sm font-semibold text-green-700 underline-offset-2 enabled:hover:underline focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              @click="onAddPasskey"
            >
              + Passkey toevoegen
            </button>
          </div>
          <p class="text-sm text-grey-700">
            Log in met je vingerafdruk, gezicht of apparaatcode in plaats van een wachtwoord.
          </p>
          <p v-if="passkeyError" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
            {{ passkeyError }}
          </p>
          <ul v-if="passkeys.length" class="divide-y divide-grey-200 rounded-lg border border-grey-200">
            <!-- Below sm the button lines up with the name: the lines under it may be wider than their column and pass
                 beneath it. -->
            <li v-for="pk in passkeys" :key="pk.id" class="flex items-start justify-between gap-4 px-4 py-3 text-sm sm:items-center">
              <span class="min-w-0">
                <span class="block font-medium text-grey-800">{{ pk.name || 'Passkey' }}</span>
                <span class="block text-grey-700">
                  {{ pk.deviceType === 'multiDevice' ? 'Gesynchroniseerd' : 'Alleen dit apparaat' }}
                  <!-- On a phone the date gets its own line: no dot left hanging. -->
                  <template v-if="pk.createdAt"><span class="hidden sm:inline"> · </span><span class="block whitespace-nowrap sm:inline">toegevoegd {{ formatDate(pk.createdAt) }}</span></template>
                </span>
              </span>
              <button
                type="button"
                :disabled="busy"
                class="rounded text-sm text-grey-700 underline-offset-2 enabled:hover:text-red-500 enabled:hover:underline focus-visible:ring-2 focus-visible:ring-green-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                @click="onDeletePasskey(pk)"
              >
                Verwijderen
              </button>
            </li>
          </ul>
          <p v-else-if="passkeysLoaded" class="text-sm text-grey-700">Nog geen passkeys.</p>
        </section>

        <p v-if="signOutFailed" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
          Uitloggen is niet gelukt. Probeer het opnieuw.
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/"
            class="flex flex-1 items-center justify-center rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500/40 focus:outline-none"
          >
            Naar de kaart
          </RouterLink>
          <button
            type="button"
            :disabled="signingOut"
            class="flex flex-1 items-center justify-center rounded-lg border border-grey-400 px-4 py-2.5 text-sm font-semibold text-grey-800 transition-colors enabled:hover:border-red-500 enabled:hover:bg-red-50 enabled:hover:text-red-500 focus:ring-2 focus:ring-green-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            @click="onSignOut"
          >
            {{ signingOut ? 'Bezig…' : 'Uitloggen' }}
          </button>
        </div>
      </template>
    </div>
  </AuthShell>
</template>
