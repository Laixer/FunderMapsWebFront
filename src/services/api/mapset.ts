import { type IMapsetFE, type IMapset } from "@/datastructures/interfaces"
import { get } from "../apiClient"

const mapMapset = (rawmapset: IMapset): IMapsetFE => {
  let metadata = {}
  let layerSet = []

  try {
    layerSet = rawmapset.layerSet ? JSON.parse(rawmapset.layerSet) : []
  } catch {
    console.warn(`Failed to process layerSet for mapset "${rawmapset?.name || rawmapset.id}"`)
  }

  try {
    metadata = rawmapset?.metadata ? JSON.parse(rawmapset.metadata) : {}
  } catch {
    console.warn('Failed to process mapset metadata')
  }

  return {
    id: rawmapset.id,
    slug: rawmapset.slug,
    name: rawmapset?.name || 'Onbekende laag',
    style: rawmapset.style,
    layers: rawmapset?.layers || [],
    metadata,
    public: (!!rawmapset?.public) || false,
    consent: rawmapset?.consent || null,
    note: rawmapset?.note || null,
    icon: rawmapset?.icon || 'home-info',
    fenceNeighborhood: rawmapset?.fenceNeighborhood || [],
    fenceDistrict: rawmapset?.fenceDistrict || [],
    fenceMunicipality: rawmapset?.fenceMunicipality || [],
    layerSet,
    loadedAt: Date.now()
  }
}

export const getAvailableMapsets = async (): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: '/mapset' })
  if (!response) {
    throw new Error('Failed to retrieve available mapsets')
  }
  return response.map(mapMapset)
}

export const getPublicAndAvailableMapsetsById = async (id: string): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: `/mapset/${id}`, requireAuth: false })
  if (!response) {
    throw new Error(`Failed to retrieve mapset: ${id}`)
  }
  return response.map(mapMapset)
}

export default {
  getAvailableMapsets,
  getPublicAndAvailableMapsetsById
}