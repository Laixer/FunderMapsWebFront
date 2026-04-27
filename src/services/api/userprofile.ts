import { type IUserProfile } from "@/datastructures/interfaces"
import { get, put } from "../apiClient"

// TS API serves /api/user/me with snake_case body. WebFront's IUserProfile
// uses camelCase. Adapter is local because the field names differ in more
// than just casing (family_name <-> lastName).

interface ApiUserMe {
  id: string
  email: string
  given_name: string | null
  family_name: string | null
  job_title: string | null
  phone_number: string | null
}

const fromApi = (raw: ApiUserMe): IUserProfile => ({
  email: raw.email ?? '',
  givenName: raw.given_name ?? '',
  lastName: raw.family_name ?? '',
  jobTitle: raw.job_title ?? '',
  phoneNumber: raw.phone_number ?? '',
})

const toApi = (data: IUserProfile): Partial<ApiUserMe> => ({
  given_name: data.givenName || null,
  family_name: data.lastName || null,
  job_title: data.jobTitle || null,
  phone_number: data.phoneNumber || null,
})

export const getUserProfile = async (): Promise<IUserProfile> => {
  const raw = await get({ endpoint: '/user/me' }) as ApiUserMe
  return fromApi(raw)
}

export const putUserProfile = async (data: IUserProfile): Promise<unknown> => {
  return put({ endpoint: '/user/me', body: toApi(data) })
}

export default {
  getUserProfile,
  putUserProfile
}
