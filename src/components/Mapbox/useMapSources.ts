
import { type Map } from "maplibre-gl";
import { type MaybeRef, shallowRef } from "vue";

/**
 * TODO: Remove a source ?
 */
export const useMapSources = function useMapSources(
  Map: MaybeRef<Map | null | undefined>
) {

  const mapInstance = shallowRef(Map)

  const currentSources: string[] = []

  const defaultMinMaxZoomLevels = {
    min: 12,
    max: 16
  }

  const sourceZoomLevels: Record<string, { min?: number, max?: number }> = {
    'incident_neighborhood': {
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

  // Sources served dynamically by the Martin tileserver
  // (VITE_FUNDERMAPS_TILESERVER_URL) instead of the static tileset bucket.
  // These are added via their TileJSON endpoint, so tile URLs, zoom range
  // and bounds come from the server instead of being duplicated here.
  //
  // This is now every source the layer configs reference, so the static
  // branch below is only reachable as a rollback (drop a name from this
  // list and it goes back to Spaces). Once the cutover has held, the
  // static path and VITE_FUNDERMAPS_TILES_URL can be removed outright —
  // deliberately kept for now so a rollback needs no redeploy of logic.
  const dynamicSources = [
    'buildings',
    'building_cluster',
    'facade_scan',
    'incident',
    'incident_district',
    'incident_municipality',
    'incident_neighborhood',
  ]

  /**
   * TileJSON endpoint for a dynamic source. Accepts both a bare base
   * template ("https://tiles.example/{SOURCE}") and the tile-URL form
   * ("https://tiles.example/{SOURCE}/{z}/{x}/{y}") in the env var.
   */
  const tileJsonPath = function tileJsonPath(sourceName: string): string {
    return (import.meta.env.VITE_FUNDERMAPS_TILESERVER_URL + '' || '')
      .replace('/{z}/{x}/{y}', '')
      .replace('{SOURCE}', sourceName)
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

    if (dynamicSources.includes(sourceName)) {
      // Tile URLs, min/max zoom and bounds all come from the TileJSON.
      mapInstance.value.addSource(
        sourceName,
        {
          type: 'vector',
          url: tileJsonPath(sourceName)
        }
      )

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

