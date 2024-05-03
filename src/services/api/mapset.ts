import { type IMapsetFE, type IMapset } from "@/datastructures/interfaces"
import { get } from "../apiClient"

const mapMapset = function mapMapset(rawmapset: IMapset): IMapsetFE {
  return {
    id: rawmapset.id,
    name: rawmapset?.name || 'Onbekende laag',
    style: rawmapset.style,
    layers: rawmapset?.layers || [],
    options: rawmapset?.options ? JSON.parse(rawmapset.options) : {},
    public: (!! rawmapset?.public) || false,
    consent: rawmapset?.consent || null,
    note: rawmapset?.note || null,
    icon: rawmapset?.icon || 'home-info',
    fenceMunicipality: rawmapset?.fenceMunicipality || null,
    layerSet: rawmapset.layerSet ? JSON.parse(rawmapset.layerSet) : []
  }
}


/******************************************************************************
 * Map Groups endpoints
 */
export const getAvailableMapsets = async function getAvailableMapsets(): Promise<IMapsetFE[]|null> {
  const response = await get({ endpoint: '/mapset' })
  if (response) {
    return response.map(mapMapset)
  }
  // TODO: Error...
  return null
}

export const getPublicAndAvailableMapsetsById = async function getAvailableMapsets(id: string): Promise<IMapsetFE[]|null> {
  console.log(id)
  const response = await get({ endpoint: `/mapset/${id}` }) // TODO: Change endpoint
  if (response) {
    return response.map(mapMapset)
  }
  // TODO: Error...
  return null
}

export default {
  getAvailableMapsets,
  getPublicAndAvailableMapsetsById
}