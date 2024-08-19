import { useRoute } from "vue-router"

export const isTileserverTest = function(): boolean {  
  const route = useRoute()
  return (
    (localStorage.getItem('TILESERVER_SOURCE') !== null || (typeof route?.query?.source === 'string'))
    && 
    (localStorage.getItem('TILESERVER_LAYER') !== null || (typeof route?.query?.layer === 'string'))
  )
}

export const getTileserverSource = function(): string|null {
  const route = useRoute()
  if (! isTileserverTest()) return null

  return localStorage.getItem('TILESERVER_SOURCE') || route?.query?.source+'' || null
}

export const getTileserverLayer = function(): string|null {
  const route = useRoute()
  if (! isTileserverTest()) return null

  return localStorage.getItem('TILESERVER_LAYER') || route?.query?.layer+'' || null
}
