
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

  const defaultMinMaxZoomLevels = {
    min: 12,
    max: 16
  }

  const sourceZoomLevels: Record<string, { min?: number, max?: number }> = {
    'boundry_municipality': {
      min: 7,
      max: 11
    },
    'incident_neighboorhood': {
      min: 10
    },
    'incident_municipality': {
      min: 7,
      max: 11
    },
    'incident_district': {
      min: 10
    }
  }

  /**
   * Add a map source
   */
  const addSource = function addSource(sourceName: string) {
    if (currentSources.includes(sourceName)) {
      return
    }

    if (!mapInstance.value) {
      return
    }

    // Source may already exist on the map from another composable instance
    if (mapInstance.value.getSource(sourceName)) {
      currentSources.push(sourceName)
      return
    }

    const sourcePath = (import.meta.env.VITE_FUNDERMAPS_TILES_URL + '' || '')
      .replace('{SOURCE}', sourceName || '')

    /**
     * Use source specific or default min / max zoom
     */
    const minzoom = sourceZoomLevels?.[sourceName]?.min || defaultMinMaxZoomLevels.min
    const maxzoom = sourceZoomLevels?.[sourceName]?.max || defaultMinMaxZoomLevels.max

    mapInstance.value.addSource(
      sourceName,
      {
        type: 'vector',
        tiles: [sourcePath],
        minzoom,
        maxzoom
      }
    )

    currentSources.push(sourceName)
  }

  return {
    addSource
  }
}

