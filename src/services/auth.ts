/**
 * Session handling for the map.
 *
 * The session is the Better Auth cookie on the API origin. The map lives on a
 * *.fundermaps.com subdomain, so the browser sends that cookie on credentialed
 * fetches to api.fundermaps.com from here (same-site, SameSite=Lax). Nothing
 * is stored in this app.
 *
 * The map is public: a visitor without a session is a guest, not an error.
 * Since 2026-10-29 the map has its own login pages (/login, /forgot-password,
 * /reset-password, /account), moved here from the separate login app
 * (FunderMapsAuth, auth.fundermaps.com), which goes.
 */
import { apiBasePath } from '@/config'
import { trimTrailingChar } from '@/utils/string'
import { call, NO_CONNECTION, failureMessage } from './authApi'
import { authClient } from './authClient'

const API = trimTrailingChar(apiBasePath, '/')

/** To the map's login page; it brings the user back to `returnTo` once the cookie is set. */
export function loginRedirect(returnTo: string = window.location.href): void {
  window.location.assign(`/login?redirect=${encodeURIComponent(returnTo)}`)
}

/** End the session server-side (clears the cookie) and reload the map as a guest. */
export async function logoutRedirect(): Promise<void> {
  try {
    await fetch(`${API}/api/auth/sign-out`, { method: 'POST', credentials: 'include' })
  } catch {
    // best-effort; reloading regardless
  }
  window.location.assign(`${window.location.origin}/`)
}

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role?: string
}

interface SessionResponse {
  session: { expiresAt: string; userId: string }
  user: SessionUser
}

export async function login(email: string, password: string): Promise<void> {
  await call({ path: '/sign-in/email', body: { email, password } })
}

/**
 * Passkey sign-in. `autoFill: true` arms the browser's conditional UI: the
 * passkey appears in the autocomplete of an input with autocomplete="webauthn"
 * and resolves when the user picks it. Without it the browser prompts at once.
 */
export async function loginWithPasskey(opts: { autoFill?: boolean } = {}): Promise<boolean> {
  // The client hands every answer back as `error`; it only throws when the
  // request for the passkey options got no answer at all.
  const res = await authClient.signIn.passkey(opts).catch(() => {
    throw new Error(NO_CONNECTION)
  })
  if (res?.error) {
    // The user dismissed the prompt, or autofill was cancelled by a
    // password submit; neither is an error worth showing.
    if (res.error.status === 0 || /abort|cancel|NotAllowed/i.test(res.error.message ?? '')) return false
    throw new Error(failureMessage(res.error.status, 'code' in res.error ? res.error.code : undefined))
  }
  return !!res?.data
}

export async function getSession(): Promise<SessionResponse | null> {
  try {
    const res = await call<SessionResponse | null>({ path: '/get-session', method: 'GET' })
    return res?.user ? res : null
  } catch {
    return null
  }
}

/**
 * Ends the session at the API, which clears the cookie. Answers whether that
 * worked: when it did not, the visitor is still logged in and must not be
 * shown the map as a guest.
 */
export async function signOut(): Promise<boolean> {
  try {
    await call({ path: '/sign-out' })
    return true
  } catch {
    return false
  }
}

/**
 * Request a password-reset email. `redirectTo` must be an origin the API
 * trusts (TRUSTED_ORIGINS); after the user clicks the email link the API
 * sends them back here with `?token=`.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await call({
    path: '/request-password-reset',
    body: { email, redirectTo: `${window.location.origin}/reset-password` },
  })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await call({ path: '/reset-password', body: { token, newPassword } })
}

/**
 * Where a login may send the visitor on: this map, or another FunderMaps
 * app (old links to auth.fundermaps.com/login?redirect=… now land here). The
 * login page must not be usable as an open redirector.
 */
export function safeRedirect(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw, window.location.origin)
    const own = url.origin === window.location.origin
    const fundermaps = url.protocol === 'https:' && /(^|\.)fundermaps\.com$/.test(url.hostname)
    const dev = import.meta.env.DEV && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    return own || fundermaps || dev ? url.toString() : null
  } catch {
    return null
  }
}

export interface Passkey {
  id: string
  name?: string | null
  deviceType: string
  backedUp: boolean
  createdAt?: string | Date | null
}

/**
 * The API wants a (new) login before it does this: the session ended somewhere
 * else while the page stayed open (401), or it is older than the API accepts
 * for adding a passkey (SESSION_NOT_FRESH). The way out is the same for both.
 */
export class SessionExpiredError extends Error {}

function passkeyFailure(error: { status?: number; code?: string; message?: string }, fallback: string): Error {
  if (error.status === 401 || error.code === 'SESSION_NOT_FRESH') return new SessionExpiredError(fallback)
  return new Error(error.message ?? fallback)
}

export async function listPasskeys(): Promise<Passkey[]> {
  const res = await authClient.passkey.listUserPasskeys()
  if (res.error) throw passkeyFailure(res.error, 'Passkeys ophalen mislukt')
  return (res.data ?? []) as Passkey[]
}

export async function addPasskey(name: string): Promise<void> {
  const res = await authClient.passkey.addPasskey({ name })
  if (res?.error) throw passkeyFailure(res.error, 'Passkey toevoegen mislukt')
}

export async function deletePasskey(id: string): Promise<void> {
  const res = await authClient.passkey.deletePasskey({ id })
  if (res.error) throw passkeyFailure(res.error, 'Passkey verwijderen mislukt')
}
