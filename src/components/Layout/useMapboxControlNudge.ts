
import { Ref, watch } from 'vue';

export const useMapboxControlNudge = function useMapboxControlNudge(
  side: 'left'|'right' = 'right', 
  offset = 336,
  isOpen: Ref
) {

  /**
   * Nudge the map controls when the sidebar opens
   *  TODO: Debounce/delay by 300 seconds, but only on close... 
   */
  watch(
    () => isOpen.value,
    (isOpen) => {
      try {
        const newOffset = isOpen ? `${offset}px` : '0px'
        if (document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)?.[0]) {
          // @ts-ignore - no, a DIV element _does_ have a style property
          document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)[0].style.setProperty(side, newOffset)
        }
        if (document.getElementsByClassName(`mapboxgl-ctrl-bottom-${side}`)?.[0]) {
          // @ts-ignore - no, a DIV element _does_ have a style property
          document.getElementsByClassName(`mapboxgl-ctrl-top-${side}`)[0].style.setProperty(side, newOffset)
        }
        
      } catch(e) {
        console.log("Error... we failed to nudge the mapbox controls position")
      }
    },
    { immediate: true }
  )
}