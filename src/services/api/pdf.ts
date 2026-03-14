import { get } from "../apiClient"

export const getPdf = async (buildingId: string): Promise<string> => {
  const response = await get({ endpoint: `/pdf/${buildingId}` })
  return (response as { accessLink: string }).accessLink
}

export default {
  getPdf
}
