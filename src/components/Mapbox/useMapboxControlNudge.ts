
import { Ref, watch } from 'vue';

export const useMapboxControlNudge = function useMapboxControlNudge(
  side: 'left'|'right' = 'right', 
  offset = 336,
  isOpen: Ref
) {

  // console.log("nudge - useMapboxControlNudge", side)

  /**
   * Checks position, and nudges if appropiate
   */
  const maybeNudge = function nudge(){
    
    // console.log("nudge - Try nudging side", side, isOpen.value)

    try {
      const newOffset = isOpen.value ? `${offset}px` : '0px'
      if (document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)?.[0]) {
        // @ts-ignore - no, a DIV element _does_ have a style property
        document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)[0].style.setProperty(side, newOffset)
      } else {
        // console.log("nudge - No controls available at bottom position")
      }

      if (document.getElementsByClassName(`mapboxgl-ctrl-top-${side}`)?.[0]) {
        // @ts-ignore - no, a DIV element _does_ have a style property
        document.getElementsByClassName(`mapboxgl-ctrl-top-${side}`)[0].style.setProperty(side, newOffset)
      } else {
        // console.log("nudge - No controls available at top position")
      }
    } catch(e) {
      console.log("nudge - Error... we failed to nudge the mapbox controls position")
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