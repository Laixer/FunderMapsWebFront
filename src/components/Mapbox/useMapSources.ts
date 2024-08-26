
import { type Map } from "mapbox-gl";
import { type MaybeRef, ref } from "vue";

/**
 * TODO: Remove a source ?
 */
export const useMapSources = function useMapSources(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = ref(Map)

  const currentSources: string[] = []

  /**
   * Add a map source
   */
  const addSource = function addSource(sourceName: string) {
    if (currentSources.includes(sourceName)) {
      return 
    }

    if (! mapInstance.value) {
      return 
    }

    const sourcePath = (import.meta.env.VITE_FUNDERMAPS_TILES_URL+'' || '')
      .replace('{SOURCE}', sourceName || '')

    // TODO: Is the zoom always the same? 
    mapInstance.value.addSource(
      sourceName, 
      {
        type: 'vector',
        tiles: [sourcePath],
        minzoom: 10,
        maxzoom: 15
      }
    )

    currentSources.push(sourceName)
  }

  return {
    addSource
  }
}

