import { type Map } from "mapbox-gl";
import { type MaybeRef, watch, ref } from "vue";
import { storeToRefs } from "pinia";

import { useMapsetStore } from '@/store/mapsets';

const defaultStyle = (import.meta.env.VITE_FUNDERMAPS_BASE_STYLE || 'mapbox://styles/laixer/clcz2iorf003414p22imzzhnk')


export const useMapStyles = function useMapStyles(
  Map: MaybeRef<Map | null | undefined>
) {

  const { activeMapset } = storeToRefs( useMapsetStore() )

  const mapInstance = ref(Map)

  let currentStyle: string = defaultStyle

  /**
   * Detect whether the map style should be changed after changing the active mapset
   */
  const maybeUpdateMapStyle = function maybeUpdateMapStyle() {
    if (! mapInstance.value || ! activeMapset.value) {
      return
    }

    const newStyle = activeMapset.value?.style 
      ? activeMapset.value.style 
      : defaultStyle

    if (currentStyle !== newStyle) {
      console.log("Updating map style")
      mapInstance.value?.setStyle(
        newStyle
      )

      currentStyle = newStyle
    }
  }

  /**
   * When the active mapset changes we check whether a style change is required
   */
  watch(
    () => activeMapset.value, 
    maybeUpdateMapStyle,
    { immediate: true }
  )

  /**
   * When the map instantiates check whether the default style is appropiate for the active mapset
   */
  watch(
    () => mapInstance.value,
    maybeUpdateMapStyle,
    { once: true }
  )
}