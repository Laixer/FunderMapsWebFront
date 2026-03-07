export const apiBasePath = import.meta.env.VITE_FUNDERMAPS_URL || ''

export const defaultMapsetId = import.meta.env.VITE_DEFAULT_MAPSET_ID || 'c81d4c1b-cc11-4f80-b324-9ab7e6cefd99'
export const defaultLayerIds = import.meta.env.VITE_DEFAULT_LAYERS || 'foundation-type-cluster,foundation-type-established,foundation-type-indicative'

export const feedbackLink = 'https://feedback.fundermaps.com/building/' // + buildingId
export const incidentLink = 'https://incident.fundermaps.com/'


export const CHART_COLORS = {
  green: "rgb(40, 204, 139)",
  blue: "rgb(23, 164, 234)",
  yellow: "rgb(255, 204, 105)",
  orange: "rgb(234, 93, 23)",
  red: "rgb(237, 28, 36)",
  pink: "rgb(206, 0, 124)",
  grey: "rgb(127, 143, 164)",
};

export const CHART_TRANSPARENT_COLORS = {
  green: "rgb(40, 204, 139, 0.5)",
  blue: "rgb(23, 164, 234, 0.5)",
  yellow: "rgb(255, 204, 105, 0.5)",
  orange: "rgb(234, 93, 23, 0.5)",
  red: "rgb(237, 28, 36, 0.5)",
  pink: "rgb(206, 0, 124, 0.5)",
  grey: "rgb(127, 143, 164, 0.5)",
}