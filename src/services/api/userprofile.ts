import { type IUserProfile } from "@/datastructures/interfaces"
import { get, put } from "../apiClient"

export const getUserProfile = () => {
  return get({ endpoint: '/user' })
}

export const putUserProfile = (data: IUserProfile) => {
  return put({ endpoint: '/user', body: data })
}

export default {
  getUserProfile,
  putUserProfile
}