/**
 * Minimal fetch wrapper over the FunderMaps API's Better Auth endpoints, for
 * the map's own login pages (moved here from FunderMapsAuth, 2026-10-29).
 * Calls `${VITE_FUNDERMAPS_URL}/api/auth/<path>`. Throws an Error carrying the
 * message to show when there is no answer or the answer is not OK: always one
 * of our own Dutch texts, never what the server sent.
 */
import { apiBasePath } from '@/config'
import { trimTrailingChar } from '@/utils/string'

const BASE = trimTrailingChar(apiBasePath, '/')

interface CallOptions {
  path: string
  method?: 'GET' | 'POST'
  body?: Record<string, unknown>
}

export const RESET_LINK_EXPIRED = 'Deze resetlink is ongeldig of verlopen. Vraag een nieuwe aan.'

/**
 * Better Auth answers in English; the pages around it are Dutch. These are the
 * answers a visitor can run into on the login and reset forms, by error code.
 */
const MESSAGES = new Map<string, string>([
  ['INVALID_EMAIL_OR_PASSWORD', 'Onjuist e-mailadres of wachtwoord.'],
  ['INVALID_EMAIL', 'Vul een geldig e-mailadres in.'],
  // The reset form writes its last sentence as a link to ask for a new one.
  ['INVALID_TOKEN', RESET_LINK_EXPIRED],
  ['PASSWORD_TOO_SHORT', 'Het wachtwoord is te kort. Gebruik minimaal 8 tekens.'],
  ['PASSWORD_TOO_LONG', 'Het wachtwoord is te lang.'],
])

const TOO_MANY_REQUESTS = 'Te veel pogingen. Wacht even en probeer het opnieuw.'
const SOMETHING_WENT_WRONG = 'Er ging iets mis. Probeer het later opnieuw.'

/** The request got no answer at all: offline, or the connection dropped. */
export const NO_CONNECTION = 'Geen verbinding met FunderMaps. Probeer het opnieuw.'

/**
 * What to tell the visitor about an answer that is not OK. An answer we have
 * no text for gets a general one, never its own: the server's message is
 * English, and an error page from the edge is raw HTML.
 */
export function failureMessage(status: number, code: unknown): string {
  return (
    (typeof code === 'string' && MESSAGES.get(code)) ||
    (status === 429 && TOO_MANY_REQUESTS) ||
    SOMETHING_WENT_WRONG
  )
}

export async function call<T = unknown>({ path, method = 'POST', body }: CallOptions): Promise<T> {
  const headers: Record<string, string> = {}
  if (body) headers['Content-Type'] = 'application/json'

  let res: Response
  let text: string
  try {
    res = await fetch(`${BASE}/api/auth${path}`, {
      method,
      headers,
      // The Better Auth session cookie is the session. Sign-in sets it on the
      // API origin; the map sends it back on credentialed fetches (same-site).
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
    text = await res.text()
  } catch {
    // The browser's own text for this is English ("Failed to fetch").
    throw new Error(NO_CONNECTION)
  }

  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!res.ok) {
    const answer = payload as { code?: unknown } | null
    throw new Error(failureMessage(res.status, answer?.code))
  }

  return payload as T
}
