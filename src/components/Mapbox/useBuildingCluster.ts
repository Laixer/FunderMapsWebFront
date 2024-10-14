
import { type MaybeRef } from "vue";
import { storeToRefs } from "pinia";
import { type Map } from "mapbox-gl";

import { useLayersStore } from "@/store/layers";

import { useToggleableLayers } from "./useToggleableLayers";

export const useBuildingCluster = function useBuildingCluster(
  Map: MaybeRef<Map | null | undefined>
) {
  const { showBuildingCluster: toggleValue } = storeToRefs(useLayersStore())
  
  useToggleableLayers(
    Map, 
    toggleValue, 
    [
      'building-cluster'
    ]
  )
}