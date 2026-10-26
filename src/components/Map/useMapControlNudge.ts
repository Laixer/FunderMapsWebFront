
import { type Ref, watch } from 'vue';

import { usePhoneLayout } from '@/components/Layout/usePhoneLayout';

export const useMapControlNudge = function useMapControlNudge(
  side: 'left'|'right' = 'right',
  offset = 336,
  isOpen: Ref<boolean>
) {

  // On a phone an open side bar covers the whole map: there is no strip of
  //  map left beside it to move the controls into.
  const isPhone = usePhoneLayout()

  /**
   * Checks position, and nudges if appropriate
   */
  const maybeNudge = function nudge(){
    try {
      const newOffset = isOpen.value && ! isPhone.value ? `${offset}px` : '0px'
      const bottom = document.getElementsByClassName(`maplibregl-ctrl-bottom-${side}`)[0] as HTMLElement | undefined
      if (bottom) {
        bottom.style.setProperty(side, newOffset)
      }

      const top = document.getElementsByClassName(`maplibregl-ctrl-top-${side}`)[0] as HTMLElement | undefined
      if (top) {
        top.style.setProperty(side, newOffset)
      }
    } catch {
      console.warn("Failed to nudge map controls position")
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

  // A window that crosses the breakpoint (a phone turned on its side)
  watch(isPhone, maybeNudge)

  return { 
    maybeNudge 
  }
}