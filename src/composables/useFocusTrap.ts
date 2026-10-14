import { watch, onBeforeUnmount, type Ref, nextTick } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// The traps that are on, in the order they were switched on. Two can be on at
// once (a remark popover with a sample dialog over it): only the last one
// handles Tab, or they would pull the focus back and forth.
const activeTraps: symbol[] = []

/**
 * Traps keyboard focus within a container element.
 * Restores focus to the previously focused element on deactivation.
 *
 * @param containerRef - Ref to the container element
 * @param isActive - Optional ref controlling when the trap is active (for v-show modals).
 *                   If omitted, the trap activates when containerRef has a value.
 */
export function useFocusTrap(
  containerRef: Ref<HTMLElement | null | undefined>,
  isActive?: Ref<boolean>
) {
  const trap = Symbol('focus trap')

  let previouslyFocused: HTMLElement | null = null
  let previouslyFocusedParents: HTMLElement[] = []

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter(el => el.offsetParent !== null)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    if (activeTraps[activeTraps.length - 1] !== trap) return

    const container = containerRef.value
    if (!container) return

    const focusable = getFocusableElements()

    // Nothing to tab to: the focus stays on the dialog itself
    if (focusable.length === 0) {
      e.preventDefault()
      container.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (!active || active === container || !container.contains(active)) {
      // The focus is not on something in the dialog (a click on the page
      // behind took it out): Tab brings it back in, and does not walk on
      // through the page behind.
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    } else if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function activate() {
    if (activeTraps.includes(trap)) return
    activeTraps.push(trap)

    previouslyFocused = document.activeElement as HTMLElement | null

    // Remembered for deactivate(): the element itself may be gone by then
    previouslyFocusedParents = []
    for (let el = previouslyFocused?.parentElement; el; el = el.parentElement) {
      previouslyFocusedParents.push(el)
    }

    document.addEventListener('keydown', handleKeydown)

    nextTick(() => {
      if (! activeTraps.includes(trap)) return

      const focusable = getFocusableElements()
      // A dialog with a form starts in its first field; the first focusable
      // element as such is the close button in the header. A dialog with
      // nothing to focus takes the focus itself (it needs tabindex="-1").
      const first = focusable.find(el => el.matches('input, select, textarea')) ?? focusable[0] ?? containerRef.value
      // Not scrolled to: a dialog whose only button is under its text (the
      // disclaimer on a small phone) opened with its first lines scrolled away
      first?.focus({ preventScroll: true })
    })
  }

  /**
   * What gets the focus back: the control that opened the dialog. When that
   * is gone (an item of a menu that closed as it opened the dialog), the
   * button of that menu: the one right inside the nearest parent that is
   * still there. Nothing else is guessed.
   */
  function getReturnTarget(): HTMLElement | null {
    if (previouslyFocused?.isConnected) return previouslyFocused

    return previouslyFocusedParents
      .find(el => el.isConnected)
      ?.querySelector<HTMLElement>(':scope > [aria-haspopup]') ?? null
  }

  function deactivate() {
    const index = activeTraps.indexOf(trap)
    if (index === -1) return
    activeTraps.splice(index, 1)

    document.removeEventListener('keydown', handleKeydown)

    // The focus goes back, unless it is already on something else outside
    // the dialog (the user clicked there, or another dialog took it)
    const active = document.activeElement
    const isElsewhere = !! active && active !== document.body && ! containerRef.value?.contains(active)
    if (! isElsewhere) getReturnTarget()?.focus()

    previouslyFocused = null
    previouslyFocusedParents = []
  }

  // Watch the active state (or containerRef existence) to toggle the trap
  const watchSource = isActive
    ? () => isActive.value && !!containerRef.value
    : () => !!containerRef.value

  watch(watchSource, (active) => {
    if (active) {
      activate()
    } else {
      deactivate()
    }
  }, { immediate: true })

  onBeforeUnmount(deactivate)
}
