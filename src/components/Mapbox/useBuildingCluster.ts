
import { type MaybeRef } from "vue";
import { storeToRefs } from "pinia";
import { type Map } from "maplibre-gl";

import { useLayersStore } from "@/store/layers";

import { useToggleableLayers } from "./useToggleableLayers";

export const useBuildingCluster = function useBuildingCluster(
  Map: MaybeRef<Map | null | undefined>
) {
  const {
    showBuildingCluster: toggleValue,
    isBuildingClusterInLegend
  } = storeToRefs(useLayersStore())
  
  useToggleableLayers(
    Map, 
    toggleValue, 
    [
      'building-cluster'
    ],
    // On a mapset with this layer in its legend, the legend decides
    isBuildingClusterInLegend
  )
}