
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

  /**
   * TileJSON endpoint for a source on the Martin tileserver. Accepts both a
   * bare base template ("https://tiles.example/{SOURCE}") and the tile-URL
   * form ("https://tiles.example/{SOURCE}/{z}/{x}/{y}") in the env var.
   */
  const tileJsonPath = function tileJsonPath(sourceName: string): string {
    return (import.meta.env.VITE_FUNDERMAPS_TILESERVER_URL + '' || '')
      .replace('/{z}/{x}/{y}', '')
      .replace('{SOURCE}', sourceName)
  }

  /**
   * Add a map source.
   *
   * Every source is served by the Martin tileserver and added via its
   * TileJSON endpoint, so tile URLs, min/max zoom and bounds come from the
   * server rather than being duplicated here. The static Spaces path that
   * used to live alongside this is gone: the tiles it read were deleted from
   * fundermaps-tileset on 2026-08-07, so it could only have produced 404s.
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

    mapInstance.value.addSource(
      sourceName,
      {
        type: 'vector',
        url: tileJsonPath(sourceName)
      }
    )

    currentSources.push(sourceName)
  }

  return {
    addSource
  }
}

