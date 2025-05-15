import { type IUserProfile } from "@/datastructures/interfaces"
import { get, put } from "../apiClient"

export const getUserProfile = async () => {
  return await get({ endpoint: '/user' })
}

export const putUserProfile = async function postUserProfile(data: IUserProfile) {
  return await put({ endpoint: '/user', body: data })
}

export default {
  getUserProfile,
  putUserProfile
}