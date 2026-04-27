import { post } from "../apiClient"

interface SignInResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

export const login = async (email: string, password: string): Promise<SignInResponse> => {
  return await post({
    endpoint: '/auth/sign-in/email',
    body: { email, password },
    requireAuth: false
  }) as SignInResponse
}

export const signOut = async (): Promise<void> => {
  await post({
    endpoint: '/auth/sign-out',
    requireAuth: true
  })
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  await post({
    endpoint: '/auth/forget-password',
    body: { email },
    requireAuth: false
  })
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await post({
    endpoint: '/auth/reset-password',
    body: { token, newPassword },
    requireAuth: false
  })
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await post({
    endpoint: '/auth/change-password',
    body: { currentPassword, newPassword },
    requireAuth: true
  })
}

export default {
  login,
  signOut,
  requestPasswordReset,
  resetPassword,
  changePassword
}
