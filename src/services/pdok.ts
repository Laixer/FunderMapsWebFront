

const baseUrl = import.meta.env.VITE_PDOK_LOCATIONSERVICE

const callPDOK = async function callPDOK(endpoint: string) {
  const response = await fetch(`${baseUrl}/${endpoint}`)

  if (response.ok) {
    return response.json()
  }

  return null
}


export const getSuggestions = async function getSuggestions(query: string, count: number|undefined|null) {
  return await callPDOK(`suggest?q=${query}&rows=${count || 5}&fq=type:(adres)`)
}

export const getSuggestionsNearCoordinates = async function getSuggestionsByCoordinates(query: string, lat: string|number, lon: string|number, count: number|undefined|null) {
  return await callPDOK(`suggest?q=${query}&lat=${lat.toString()}&lon=${lon.toString()}&rows=${count || 5}&fq=type:(adres)`)
}

export const getReverse = async function getReverse(lat: string|number, lon: string|number, count: number|undefined|null) {
  return await callPDOK(`reverse?lat=${lat.toString()}&lon=${lon.toString()}&rows=${count || 5}&fq=type:(adres)`)
}

export const getLookup = async function getLookup(id: string) {
  return await callPDOK(`lookup?id=${id}`)
}
