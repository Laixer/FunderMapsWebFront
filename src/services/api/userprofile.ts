import { type IOrg, type IUserProfile } from "@/datastructures/interfaces"
import { get, put } from "../apiClient"

interface ApiUserMe {
  id: string
  email: string
  given_name: string | null
  family_name: string | null
  job_title: string | null
  phone_number: string | null
  organizations?: { id: string; name: string; role: string }[]
}

export interface UserMe {
  profile: IUserProfile
  organizations: IOrg[]
}

export const getMe = async (signal?: AbortSignal): Promise<UserMe> => {
  const raw = await get({ endpoint: '/user/me', signal }) as ApiUserMe
  return {
    profile: {
      email: raw.email ?? '',
      givenName: raw.given_name ?? '',
      lastName: raw.family_name ?? '',
      jobTitle: raw.job_title ?? '',
      phoneNumber: raw.phone_number ?? '',
    },
    organizations: raw.organizations ?? [],
  }
}

export const putUserProfile = async (data: IUserProfile): Promise<unknown> => {
  return put({
    endpoint: '/user/me',
    body: {
      given_name: data.givenName || null,
      family_name: data.lastName || null,
      job_title: data.jobTitle || null,
      phone_number: data.phoneNumber || null,
    },
  })
}

export default {
  getMe,
  putUserProfile,
}
