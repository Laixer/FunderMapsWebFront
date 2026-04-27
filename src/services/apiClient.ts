import { apiBasePath } from "@/config"
import { trimLeadingChar, trimTrailingChar } from "@/utils/string"
import { getAuthHeader, hasToken } from '@/services/token'
import router from '@/router'


/******************************************************************************
 * API Key overrides JWT auth
 */
const apiKey: string | null = import.meta.env.VITE_AUTH_KEY || null

export const hasAPIKey = function hasAPIKey() {
  return apiKey !== null && apiKey.length !== 0
}

const getAPIKeyAuthHeader = function getAPIKeyAuthHeader() {
  return {
    'Authorization': 'authkey ' + apiKey
  }
}


/******************************************************************************
 * Verify auth credentials before making a call.
 * Always throws on failure — never silently redirects.
 */
function verifyAuth(requireAuth: boolean): void {
  if (!requireAuth || hasAPIKey()) return

  if (!hasToken()) {
    throw new APITokenError("Missing access token")
  }
}

const makeCall = async ({
  endpoint, method = 'GET', body, requireAuth = true
}: {
  endpoint: string,
  method?: 'GET' | 'POST' | 'PUT',
  body?: unknown,
  requireAuth?: boolean,
}) => {
  let fetchOptions: RequestInit = {}
  let responseBody = null

  try {
    verifyAuth(requireAuth)

    // Auth header
    let authHeader = {}
    if (requireAuth) {
      authHeader = hasAPIKey() ? getAPIKeyAuthHeader() : getAuthHeader()!
    }

    // Options
    fetchOptions = {
      method,
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      ...(body !== undefined && { body: JSON.stringify(body) })
    }

    const response = await fetch(
      combineEndpoint(endpoint),
      fetchOptions
    )

    // Get the response body, preferably processed as json
    // Note: A failed call can often still have a valid json body, containing info about the error
    try {
      if (response.status !== 204) {
        responseBody = await response.json()
      }
    } catch {
      if (response.ok && response.status !== 204) {
        throw new Error("Failed to process response body")
      }
    }

    if (!response.ok) {
      throw new APIErrorResponse(
        response.status,
        responseBody
      )
    }

    return responseBody
  } catch (err: unknown) {
    // Redirect to login on auth failure
    if (err instanceof APITokenError) {
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' })
      }
      throw err
    }

    if (err instanceof APIClientError) {
      throw err
    }

    throw new APICallError(
      err,
      endpoint,
      fetchOptions,
      responseBody
    )
  }
}

/******************************************************************************
 * Error classes
 */
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
  status = 403

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

  constructor(
    err: unknown,
    endpoint: string,
    options: object,
    responseBody: unknown
  ) {
    super(`API call failed: ${endpoint}`)
    this.name = 'APICallError'
    this.err = err
    this.endpoint = endpoint
    this.options = options
    this.responseBody = responseBody
  }
}

/******************************************************************************
 * Shortcuts
 */
export const get = ({ endpoint, body, requireAuth }:
  { endpoint: string, body?: unknown, requireAuth?: boolean }
) => {
  return makeCall({ endpoint, method: 'GET', body, requireAuth })
}

export const post = ({ endpoint, body, requireAuth }:
  { endpoint: string, body?: unknown, requireAuth?: boolean }
) => {
  return makeCall({ endpoint, method: 'POST', body, requireAuth })
}

export const put = ({ endpoint, body, requireAuth }:
  { endpoint: string, body?: unknown, requireAuth?: boolean }
) => {
  return makeCall({ endpoint, method: 'PUT', body, requireAuth })
}

/******************************************************************************
 * Internal helper methods
 */

/**
 * Combine the endpoint with the base path while removing the trailing & leading / of the two segments
 */
function combineEndpoint(endpoint: string) {
  return `${trimTrailingChar(apiBasePath, '/')}/api/${trimLeadingChar(endpoint, '/')}`
}
