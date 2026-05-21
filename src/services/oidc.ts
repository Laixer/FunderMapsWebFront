/**
 * OIDC (authorization-code + PKCE) client for the FunderMaps auth provider.
 *
 * WebFront is a trusted first-party OIDC client. Login happens at the auth app
 * (auth.fundermaps.com); we exchange the returned code for an access token + a
 * refresh token (offline_access). The access token is short-lived (1h); when it
 * expires the API client silently calls refresh() instead of bouncing the user
 * to login — important for the map, which we don't want to reload mid-session.
 * Guest browsing (public mapsets) keeps working without any of this.
 */
import { apiBasePath } from '@/config'
import {
  getIdToken,
  getRefreshToken,
  removeTokens,
  storeTokens,
} from '@/services/token'

const API = apiBasePath.replace(/\/+$/, '')
const CLIENT_ID = 'webfront'
const VERIFIER_KEY = 'oidc_pkce_verifier'
const STATE_KEY = 'oidc_state'

const redirectUri = (): string => `${window.location.origin}/auth/callback`
const postLogoutUri = (): string => `${window.location.origin}/`

function base64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomUrlSafe(byteLength: number): string {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)))
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64url(new Uint8Array(digest))
}

/** Begin login: stash PKCE verifier + state, navigate to /oauth2/authorize. */
export async function loginRedirect(): Promise<void> {
  const verifier = randomUrlSafe(48)
  const state = randomUrlSafe(16)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    // offline_access → the provider also issues a refresh token.
    scope: 'openid email profile offline_access',
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: 'S256',
  })
  window.location.assign(`${API}/api/auth/oauth2/authorize?${params.toString()}`)
}

/** Finish login: validate state, exchange the code for tokens, store them. */
export async function exchangeCode(code: string, state: string): Promise<void> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  const expectedState = sessionStorage.getItem(STATE_KEY)
  if (!verifier || !state || state !== expectedState) {
    throw new Error('Invalid OIDC state')
  }

  const res = await fetch(`${API}/api/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`)
  const tokens = await res.json()
  if (!tokens.access_token) throw new Error('No access token in token response')

  storeTokens(tokens)
  sessionStorage.removeItem(VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
}

// Single-flight refresh: concurrent 401s share one refresh round-trip.
let refreshInFlight: Promise<boolean> | null = null

/**
 * Exchange the (rotated) refresh token for a fresh access token. Returns true
 * on success (tokens stored). Returns false if there's no refresh token or the
 * provider rejects it — the caller then treats the session as expired.
 */
export function refresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API}/api/auth/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    })
    if (!res.ok) return false
    const tokens = await res.json()
    if (!tokens.access_token) return false
    storeTokens(tokens) // rotates the refresh token too
    return true
  } catch {
    return false
  }
}

/**
 * RP-initiated logout: clear local tokens, then end the SSO session at the
 * provider and return to the map (as a guest). Falls back to a plain reload to
 * home if there's no id_token to hint with.
 */
export function logoutRedirect(): void {
  const idToken = getIdToken()
  removeTokens()
  if (!idToken) {
    window.location.assign(postLogoutUri())
    return
  }
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutUri(),
    client_id: CLIENT_ID,
  })
  window.location.assign(`${API}/api/auth/oauth2/end-session?${params.toString()}`)
}
