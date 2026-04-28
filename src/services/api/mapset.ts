import { type IMapsetFE, type IMapsetLayer } from "@/datastructures/interfaces"
import { get } from "../apiClient"

// Wire shape returned by /api/mapset on the TS API: mostly camelCase but
// fence_* fields use snake_case. layerset and metadata are jsonb columns
// already parsed to array/object by postgres.js.
interface RawMapset {
  id: string
  slug: string
  name: string
  style: string
  metadata: object | null
  public: boolean | null
  consent: string | null
  note: string | null
  icon: string | null
  layerset: IMapsetLayer[] | null
  fence_neighborhood: string[] | null
  fence_district: string[] | null
  fence_municipality: string[] | null
}

const mapMapset = (raw: RawMapset): IMapsetFE => ({
  id: raw.id,
  slug: raw.slug,
  name: raw.name || 'Onbekende laag',
  style: raw.style,
  metadata: (raw.metadata as { center?: number[] }) ?? {},
  public: !!raw.public,
  consent: raw.consent ?? null,
  note: raw.note ?? null,
  icon: raw.icon ?? 'home-info',
  fenceNeighborhood: raw.fence_neighborhood ?? [],
  fenceDistrict: raw.fence_district ?? [],
  fenceMunicipality: raw.fence_municipality ?? [],
  layerSet: raw.layerset ?? [],
  loadedAt: Date.now(),
})

export const getAvailableMapsets = async (): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: '/mapset' }) as RawMapset[] | null
  if (!response) throw new Error('Failed to retrieve available mapsets')
  return response.map(mapMapset)
}

export const getPublicAndAvailableMapsetsById = async (id: string): Promise<IMapsetFE[]> => {
  const response = await get({ endpoint: `/mapset/${id}`, requireAuth: false }) as RawMapset[] | null
  if (!response) throw new Error(`Failed to retrieve mapset: ${id}`)
  return response.map(mapMapset)
}

export default {
  getAvailableMapsets,
  getPublicAndAvailableMapsetsById,
}
