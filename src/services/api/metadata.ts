import { get, put } from "../apiClient"

// TS API stores metadata as a jsonb column on application.application_user
// and returns the *whole row* ({userId, applicationId, metadata, updateDate}).
// The actual user metadata is the nested .metadata field — unwrap it,
// otherwise the store treats the row envelope as the metadata bag and every
// getItem('lastCenterPosition') etc. comes back undefined.
export const getMetadata = async (): Promise<unknown> => {
  const response = await get({ endpoint: '/user/metadata' }) as { metadata?: unknown } | null | undefined
  return response?.metadata ?? null
}

export const setMetadata = (body: object): Promise<unknown> => {
  return put({ endpoint: '/user/metadata', body: { metadata: body } })
}

export default {
  getMetadata,
  setMetadata
}
