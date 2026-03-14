import { get, post } from "../apiClient"

interface AuthTokenResponse {
  token: string
}

export const login = async (email: string, password: string): Promise<AuthTokenResponse> => {
  return await post({
    endpoint: '/auth/signin',
    body: {
      email, password
    },
    requireAuth: false
  }) as AuthTokenResponse
}

export const refresh = async (): Promise<AuthTokenResponse> => {
  return await get({
    endpoint: 'auth/token-refresh',
    requireAuth: true
  }) as AuthTokenResponse
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  await post({
    endpoint: '/auth/reset-password',
    body: {
      email
    },
    requireAuth: false
  })
}

export const resetPassword = async (email: string, token: string, password: string): Promise<void> => {
  await post({
    endpoint: '/auth/reset-new-password',
    body: {
      email,
      resetKey: token,
      newPassword: password
    },
    requireAuth: false
  })
}

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await post({
    endpoint: '/auth/change-password',
    body: {
      oldPassword: oldPassword,
      newPassword: newPassword
    },
    requireAuth: true
  })
}

export default {
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
  changePassword
}
