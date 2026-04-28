import { apiBasePath } from "@/config"
import { trimLeadingChar, trimTrailingChar } from "@/utils/string"
import { getAuthHeader, hasToken, removeAccessToken } from '@/services/token'
import { emitAuthExpired } from '@/services/authEvents'

type Method = 'GET' | 'POST' | 'PUT'

interface CallOptions {
  endpoint: string
  method?: Method
  body?: unknown
  requireAuth?: boolean
  signal?: AbortSignal
}

const makeCall = async ({
  endpoint, method = 'GET', body, requireAuth = true, signal,
}: CallOptions): Promise<unknown> => {
  let fetchOptions: RequestInit = {}
  let responseBody: unknown = null

  try {
    // Pre-flight: throw without emitting auth-expired. Callers should
    // guard on isAuthenticated before making authenticated calls; this
    // is the safety net. Emitting here would cycle if a logout flow
    // makes its own (now-tokenless) calls.
    if (requireAuth && !hasToken()) {
      throw new APITokenError('Missing access token')
    }

    fetchOptions = {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(requireAuth ? getAuthHeader() : {}),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }

    const response = await fetch(buildUrl(endpoint), fetchOptions)

    // 204 No Content is the only status with a guaranteed empty body. Any
    // other response — even errors — may carry a JSON body with details.
    if (response.status !== 204) {
      try {
        responseBody = await response.json()
      } catch {
        if (response.ok) throw new Error('Failed to process response body')
      }
    }

    if (!response.ok) {
      // Server says our token is no good. Drop it locally and signal the
      // shell so it can clear session state and navigate to login.
      if (requireAuth && response.status === 401) {
        removeAccessToken()
        emitAuthExpired()
        throw new APITokenError('Server rejected token (401)')
      }
      throw new APIErrorResponse(response.status, responseBody)
    }

    return responseBody
  } catch (err: unknown) {
    if (err instanceof APIClientError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new APICallError(err, endpoint, fetchOptions, responseBody)
  }
}

// ----------------------------------------------------------------------------
// Errors
// ----------------------------------------------------------------------------

export class APIClientError extends Error {
  constructor(message = 'API client error') {
    super(message)
    this.name = 'APIClientError'
  }
}

export class APIErrorResponse extends APIClientError {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API error: ${status}`)
    this.name = 'APIErrorResponse'
    this.status = status
    this.body = body
  }
}

export class APITokenError extends APIClientError {
  status = 401

  constructor(message: string) {
    super(message)
    this.name = 'APITokenError'
  }
}

export class APICallError extends APIClientError {
  status = 500
  body = 'The API call failed'
  err: unknown
  endpoint: string
  options: object
  responseBody: unknown

  constructor(err: unknown, endpoint: string, options: object, responseBody: unknown) {
    super(`API call failed: ${endpoint}`)
    this.name = 'APICallError'
    this.err = err
    this.endpoint = endpoint
    this.options = options
    this.responseBody = responseBody
  }
}

// ----------------------------------------------------------------------------
// Method shortcuts. GET deliberately has no `body` — fetch ignores GET bodies
// and silently dropping a body is a footgun.
// ----------------------------------------------------------------------------

export const get = (opts: { endpoint: string; requireAuth?: boolean; signal?: AbortSignal }) =>
  makeCall({ ...opts, method: 'GET' })

export const post = (opts: { endpoint: string; body?: unknown; requireAuth?: boolean; signal?: AbortSignal }) =>
  makeCall({ ...opts, method: 'POST' })

export const put = (opts: { endpoint: string; body?: unknown; requireAuth?: boolean; signal?: AbortSignal }) =>
  makeCall({ ...opts, method: 'PUT' })

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function buildUrl(endpoint: string): string {
  return `${trimTrailingChar(apiBasePath, '/')}/api/${trimLeadingChar(endpoint, '/')}`
}
