
import { get } from "../apiClient"

/**
 * returns a single org based on the active user session
 */
export const getPdf = async function getPdf(buildingId: string) {
  return await get({ endpoint: `/pdf/${buildingId}` })
}

export default {
  getPdf
}
