
import { type MaybeRef, watch, ref } from "vue";
import { type LayerSpecification, type SourceSpecification, type Map } from "mapbox-gl";
import { isTileserverTest } from "@/utils/tileserverTest";


export const useTileServerTest = function useTileServerTest(
  Map: MaybeRef<Map | null | undefined>,
  sourceName: string,
  sourceConfig: SourceSpecification,
  layerConfig: LayerSpecification
) {

  const mapInstance = ref(Map)
  if (! isTileserverTest()) {
    return
  }

  /**
   * mapInstance is set during mapbox onLoad event
   */
  watch(
    () => mapInstance.value,
    (mapInstance) => {
      mapInstance?.addSource(sourceName, sourceConfig)
      mapInstance?.addLayer(layerConfig)
    }
  )
}