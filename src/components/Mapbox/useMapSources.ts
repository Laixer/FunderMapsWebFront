
import { type Map } from "mapbox-gl";
import { type MaybeRef, ref, watch } from "vue";

/**
 * TODO: Remove a source ?
 */
export const useMapSources = function useMapSources(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = ref(Map)

  let currentSources: string[] = []

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

    if (! mapInstance.value) {
      return 
    }

    const sourcePath = (import.meta.env.VITE_FUNDERMAPS_TILES_URL+'' || '')
      .replace('{SOURCE}', sourceName || '')

    /**
     * Use source specific or default min / max zoom
     */
    const minzoom = sourceZoomLevels?.[sourceName]?.min || defaultMinMaxZoomLevels.min
    const maxzoom = sourceZoomLevels?.[sourceName]?.max || defaultMinMaxZoomLevels.max

    /**
     * Avoid loading a source twice
     */
    if (mapInstance.value.getSource(sourceName)) {
      return 
    }

    // TODO: Is the zoom always the same? 
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

  /**
   * Reset the list of loaded sources
   */
  const resetSources = function resetSources() {
    currentSources = []
  }

  /**
   * Reset the list of loaded sources upon changing styles
   */
  watch(
    () => mapInstance.value,
    () => {
      mapInstance.value?.on('style.load', resetSources)
    },
    { once: true }
  )

  return {
    addSource,
    resetSources
  }
}

