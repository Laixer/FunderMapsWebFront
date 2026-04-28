export const apiBasePath = import.meta.env.VITE_FUNDERMAPS_URL || ''

export const defaultMapsetId = import.meta.env.VITE_DEFAULT_MAPSET_ID || 'c81d4c1b-cc11-4f80-b324-9ab7e6cefd99'
export const defaultLayerIds = import.meta.env.VITE_DEFAULT_LAYERS || 'foundation-type-cluster,foundation-type-established,foundation-type-indicative'

export const feedbackLink = 'https://feedback.fundermaps.com/building/' // + buildingId
export const incidentLink = 'https://incident.fundermaps.com/'