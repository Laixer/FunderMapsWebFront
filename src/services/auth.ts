/**
 * Session handling for the map.
 *
 * The session is the Better Auth cookie on the API origin. Every FunderMaps
 * app lives on a *.fundermaps.com subdomain, so the browser sends that cookie
 * on credentialed fetches to api.fundermaps.com from here (same-site,
 * SameSite=Lax). Nothing is stored in this app.
 *
 * The map is public: a visitor without a session is a guest, not an error.
 * Login happens at the auth app (auth.fundermaps.com); it returns the user
 * to the page they came from once the cookie is set.
 */
import { apiBasePath } from '@/config'
import { trimTrailingChar } from '@/utils/string'

const API = trimTrailingChar(apiBasePath, '/')
const AUTH = trimTrailingChar(import.meta.env.VITE_AUTH_URL || 'https://auth.fundermaps.com', '/')

/** Full-page navigation to the auth app; it sends the user back here after login. */
export function loginRedirect(returnTo: string = window.location.href): void {
  window.location.assign(`${AUTH}/login?redirect=${encodeURIComponent(returnTo)}`)
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
