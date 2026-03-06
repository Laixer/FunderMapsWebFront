import { useRoute } from "vue-router"

export const isTileserverTest = (): boolean => {
  const route = useRoute()
  return (
    (localStorage.getItem('TILESERVER_SOURCE') !== null || (typeof route?.query?.source === 'string'))
    &&
    (localStorage.getItem('TILESERVER_LAYER') !== null || (typeof route?.query?.layer === 'string'))
  )
}
