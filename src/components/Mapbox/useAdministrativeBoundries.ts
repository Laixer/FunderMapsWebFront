

import { type MaybeRef } from "vue";
import { storeToRefs } from "pinia";
import { type Map } from "mapbox-gl";

import { useLayersStore } from "@/store/layers";

import { useToggleableLayers } from "./useToggleableLayers";

export const useAdminstrativeBoundaries = function useAdminstrativeBoundaries(
  Map: MaybeRef<Map | null | undefined>
) {
  const { showAdministrativeBoundaries: toggleValue } = storeToRefs(useLayersStore())
  
  useToggleableLayers(
    Map, 
    toggleValue, 
    [
      'boundry-municipality',
      'boundry-neighborhood',
      'boundry-district'
    ]
  )
}
