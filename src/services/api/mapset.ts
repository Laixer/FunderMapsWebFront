import { type IMapsetFE, type IMapset, type IMapsetLayer } from "@/datastructures/interfaces"
import { get } from "../apiClient"

// TS API returns mapset rows as raw PG: snake_case `layerset` (jsonb, already
// parsed to array) and `metadata` (jsonb, already parsed to object). The
// older C# WebApi returned `layerSet` (camelCase) as JSON-encoded strings.
// Read both to stay tolerant during the cutover; drop the C# fallbacks
// once the API is the only source.
const mapMapset = (raw: IMapset & { layerset?: unknown }): IMapsetFE => {
  const layerSetRaw = (raw as { layerset?: unknown }).layerset ?? raw.layerSet
  let layerSet: unknown[] = []
  if (Array.isArray(layerSetRaw)) {
    layerSet = layerSetRaw
  } else if (typeof layerSetRaw === 'string') {
    try { layerSet = JSON.parse(layerSetRaw) } catch {
      console.warn(`Failed to parse layerSet string for mapset "${raw?.name || raw.id}"`)
    }
  }

  const metadataRaw = raw?.metadata
  let metadata: object = {}
  if (metadataRaw && typeof metadataRaw === 'object') {
    metadata = metadataRaw as object
  } else if (typeof metadataRaw === 'string') {
    try { metadata = JSON.parse(metadataRaw) } catch {
      console.warn(`Failed to parse metadata string for mapset "${raw?.name || raw.id}"`)
    }
  }

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw?.name || 'Onbekende laag',
    style: raw.style,
    metadata,
    public: (!!raw?.public) || false,
    consent: raw?.consent || null,
    note: raw?.note || null,
    icon: raw?.icon || 'home-info',
    fenceNeighborhood: (raw as { fence_neighborhood?: string[] | null }).fence_neighborhood ?? raw?.fenceNeighborhood ?? [],
    fenceDistrict: (raw as { fence_district?: string[] | null }).fence_district ?? raw?.fenceDistrict ?? [],
    fenceMunicipality: (raw as { fence_municipality?: string[] | null }).fence_municipality ?? raw?.fenceMunicipality ?? [],
    layerSet: layerSet as IMapsetLayer[],
    loadedAt: Date.now()
  }
}

export const getAvailableMapsets = async (): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: '/mapset' }) as IMapset[] | null
  if (!response) {
    throw new Error('Failed to retrieve available mapsets')
  }
  return response.map(mapMapset)
}

export const getPublicAndAvailableMapsetsById = async (id: string): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: `/mapset/${id}`, requireAuth: false }) as IMapset[] | null
  if (!response) {
    throw new Error(`Failed to retrieve mapset: ${id}`)
  }
  return response.map(mapMapset)
}

export default {
  getAvailableMapsets,
  getPublicAndAvailableMapsetsById
}
