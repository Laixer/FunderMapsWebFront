import { apiBasePath } from "@/config"
import { trimLeadingChar, trimTrailingChar } from "@/utils/string"
import { getAuthHeader, hasAccessToken, hasAccessTokenExpired } from '@/services/jwt.ts'
import { useRouter, useRoute } from 'vue-router'


/******************************************************************************
 * API Key overrides JWT auth
 */
const apiKey: string | null = import.meta.env.VITE_AUTH_KEY || null

export const hasAPIKey = function hasAPIKey() {
  return apiKey !== null && apiKey.length !== 0
}

const getAPIKey = function getAPIKey() {
  return apiKey
}
const getAPIKeyAuthHeader = function getAPIKeyAuthHeader() {
  return {
    'Authorization': 'authkey ' + getAPIKey()
  }
}


/******************************************************************************
 * The function thats is calling the shots
 */

const passAuthCheckOrExit = function passAuthOrThrowException(requireAuth: boolean, autoredirect: boolean) {
  // Check for auth
  try {
    if (requireAuth && !hasAPIKey()) {
      if (!hasAccessToken()) {
        throw new APITokenError("Missing access token")
      }

      if (hasAccessTokenExpired()) {
        throw new APITokenError("Access token has expired")
      }
    }
  } catch (e) {
    console.log("failed to pass auth check")
    console.log(e)

    // When auth is required & missing / expired => redirect to login
    if (autoredirect) {
      const route = useRoute()
      if (route.name !== 'Login') {
        const router = useRouter()
        router.push({ name: 'login' })
      }
      return
    } else {
      throw e
    }
  }
}

const makeCall = async ({
  endpoint, method = 'GET', body, requireAuth = true, autoredirect = true
}: {
  endpoint: string,
  method?: 'GET' | 'POST' | 'PUT',
  body?: unknown,
  requireAuth?: boolean,
  autoredirect?: boolean
}) => {
  let fetchOptions = {}
  let authHeader = {}
  let responseBody = null

  try {
    passAuthCheckOrExit(requireAuth, autoredirect)

    // Auth
    if (requireAuth) {
      if (hasAPIKey()) {
        authHeader = getAPIKeyAuthHeader()
      } else {
        authHeader = getAuthHeader()
      }
    }

    // Options
    fetchOptions = {
      method,
      headers: Object.assign(
        authHeader,
        {
          "Content-Type": "application/json",
        }
      ),
      body: JSON.stringify(body)
    }

    const response = await fetch(
      combineEndpoint(endpoint),
      fetchOptions
    )

    // Get the response body, preferrably processed as json
    // Note: A failed call can often still have a valid json body, containing info about the error
    try {
      if (response.status !== 204) {
        responseBody = await response.json()
      }
    } catch (e) {
      console.log(e)

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

    passAuthCheckOrExit(requireAuth, autoredirect)

    return responseBody
  } catch (err: unknown) {
    console.log(err)

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
 *  Note: this is a rather basic implementation
 */
export class APIClientError { }
export class APIErrorResponse extends APIClientError {

  // The status code of the error response 
  status: number

  // The response (JSON parsed) body
  body: unknown

  constructor(status: number, body: unknown) {
    super()

    this.status = status
    this.body = body
  }
}

export class APITokenError extends APIClientError {
  status = 403
  message: string

  constructor(message: string) {
    super()

    this.message = message
  }
}

export class APICallError extends APIClientError {

  status = 500
  body = 'The API call failed'

  // The thrown error
  err: unknown

  // Some api call context information
  endpoint: string
  options: object
  responseBody: unknown

  constructor(
    err: unknown,
    endpoint: string,
    options: object,
    responseBody: unknown
  ) {
    super()

    this.err = err
    this.endpoint = endpoint
    this.options = options
    this.responseBody = responseBody
  }
}

/******************************************************************************
 * Shortcuts
 */
export const get = ({ endpoint, body, requireAuth, autoredirect }:
  { endpoint: string, body?: unknown, requireAuth?: boolean, autoredirect?: boolean }
) => {
  return makeCall({ endpoint, method: 'GET', body, requireAuth, autoredirect })
}

export const post = ({ endpoint, body, requireAuth, autoredirect }:
  { endpoint: string, body?: unknown, requireAuth?: boolean, autoredirect?: boolean }
) => {
  return makeCall({ endpoint, method: 'POST', body, requireAuth, autoredirect })
}

export const put = ({ endpoint, body, requireAuth, autoredirect }:
  { endpoint: string, body?: unknown, requireAuth?: boolean, autoredirect?: boolean }
) => {
  return makeCall({ endpoint, method: 'PUT', body, requireAuth, autoredirect })
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