
import { get, post } from "../apiClient"

export const login = async function login(email: string, password: string) {
  return await post({ 
    endpoint: '/auth/signin',
    body: {
      email, password
    },
    requireAuth: false
  })
}

export const refresh = async function refresh() {
  return await get({
    endpoint: 'auth/token-refresh',
    requireAuth: false
  })
}

/**
 * Send a request for a password reset mail
 */
export const requestPasswordReset = async function requestPasswordReset(email: string) {
  return await post({ 
    endpoint: '/auth/reset-password',
    body: {
      email
    },
    requireAuth: false
  })
}

/**
 * Send a request for a password reset mail
 */
export const resetPassword = async function resetPassword(email: string, token: string, password: string) {
  return await post({ 
    endpoint: '/auth/reset-new-password',
    body: {
      email,
      resetKey: token,
      newPassword: password
    },
    requireAuth: false
  })
}

export default {
  login,
  refresh,
  requestPasswordReset,
  resetPassword
}
