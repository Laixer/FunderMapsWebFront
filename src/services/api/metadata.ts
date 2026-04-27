import { get, put } from "../apiClient"

// TS API stores metadata as jsonb (object), not as a string. The endpoint
// at /api/user/metadata returns the raw object — no JSON.parse needed.
export const getMetadata = async (): Promise<unknown> => {
  const response = await get({ endpoint: '/user/metadata' })
  return response ?? null
}

export const setMetadata = (body: object): Promise<unknown> => {
  return put({ endpoint: '/user/metadata', body: { metadata: body } })
}

export default {
  getMetadata,
  setMetadata
}
