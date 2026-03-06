
import { Ref, watch } from 'vue';

export const useMapboxControlNudge = function useMapboxControlNudge(
  side: 'left'|'right' = 'right', 
  offset = 336,
  isOpen: Ref
) {

  /**
   * Checks position, and nudges if appropriate
   */
  const maybeNudge = function nudge(){
    try {
      const newOffset = isOpen.value ? `${offset}px` : '0px'
      if (document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)?.[0]) {
        // @ts-expect-error - no, a DIV element _does_ have a style property
        document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)[0].style.setProperty(side, newOffset)
      }

      if (document.getElementsByClassName(`mapboxgl-ctrl-top-${side}`)?.[0]) {
        // @ts-expect-error - no, a DIV element _does_ have a style property
        document.getElementsByClassName(`mapboxgl-ctrl-top-${side}`)[0].style.setProperty(side, newOffset)
      }
    } catch {
      console.warn("Failed to nudge mapbox controls position")
    }
  }

  /**
   * Nudge the map controls when the sidebar opens
   *  TODO: Debounce/delay by 300 seconds, but only on close... 
   */
  watch(
    () => isOpen.value,
    maybeNudge,
    { immediate: true }
  )

  return { 
    maybeNudge 
  }
}