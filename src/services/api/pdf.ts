import { get } from "../apiClient"

export const getPdf = (buildingId: string) => {
  return get({ endpoint: `/pdf/${buildingId}` })
}

export default {
  getPdf
}
