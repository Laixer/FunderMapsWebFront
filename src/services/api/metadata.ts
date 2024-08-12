
import { get, put } from "../apiClient"

/**
 * Retrieve user meta data
 */
export const getMetadata = async function getMetadata() {
  return await get({ endpoint: '/metadata' })
}

/**
 * Store user meta data
 */
export const setMetadata = async function setMetadata(body: object) {
  return await put({ endpoint: '/metadata', body })
}

export default {
  getMetadata,
  setMetadata
}
