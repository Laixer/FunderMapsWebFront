import { get, put } from "../apiClient"

export const getMetadata = async (): Promise<unknown> => {
  const response = await get({ endpoint: '/metadata' })
  return JSON.parse(response?.metadata)
}

export const setMetadata = (body: object): Promise<unknown> => {
  return put({ endpoint: '/metadata', body: { metadata: body } })
}

export default {
  getMetadata,
  setMetadata
}
