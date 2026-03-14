const baseUrl = import.meta.env.VITE_PDOK_LOCATIONSERVICE

interface PDOKDoc {
  type: string
  weergavenaam: string
  id: string
  score: number
  adrestype: string | null
  centroide_ll?: string
  nummeraanduiding_id?: string
  [key: string]: unknown
}

interface PDOKResponse {
  response: {
    docs: PDOKDoc[]
    numFound: number
  }
}

const callPDOK = async (endpoint: string): Promise<PDOKResponse | null> => {
  const response = await fetch(`${baseUrl}/${endpoint}`)

  if (!response.ok) {
    console.warn(`PDOK request failed: ${response.status} ${response.statusText}`)
    return null
  }

  try {
    return await response.json()
  } catch (e) {
    console.warn("Failed to process PDOK response", e)
    return null
  }
}

export const getSuggestions = async (query: string, count: number | undefined | null): Promise<PDOKResponse | null> => {
  return await callPDOK(`suggest?q=${query}&rows=${count || 5}&fq=type:(woonplaats OR postcode OR adres)`)
}

export const getSuggestionsNearCoordinates = async (query: string, lat: string | number, lon: string | number, count: number | undefined | null): Promise<PDOKResponse | null> => {
  return await callPDOK(`suggest?q=${query}&lat=${lat.toString()}&lon=${lon.toString()}&rows=${count || 5}&fq=type:(woonplaats OR postcode OR adres)`)
}

export const getReverse = async (lat: string | number, lon: string | number, count: number | undefined | null): Promise<PDOKResponse | null> => {
  return await callPDOK(`reverse?lat=${lat.toString()}&lon=${lon.toString()}&rows=${count || 5}&fq=type:(adres)`)
}

export const getLookup = async (id: string): Promise<PDOKResponse | null> => {
  return await callPDOK(`lookup?id=${id}`)
}
