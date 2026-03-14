import { type IUserProfile } from "@/datastructures/interfaces"
import { get, put } from "../apiClient"

export const getUserProfile = (): Promise<IUserProfile> => {
  return get({ endpoint: '/user' }) as Promise<IUserProfile>
}

export const putUserProfile = (data: IUserProfile): Promise<unknown> => {
  return put({ endpoint: '/user', body: data })
}

export default {
  getUserProfile,
  putUserProfile
}
