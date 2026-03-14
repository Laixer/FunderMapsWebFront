import { get, put } from "../apiClient"

export const getMetadata = async () => {
  const response = await get({ endpoint: '/metadata' })
  return JSON.parse(response?.metadata)
}

export const setMetadata = (body: object) => {
  return put({ endpoint: '/metadata', body: { metadata: body } })
}

export default {
  getMetadata,
  setMetadata
}
