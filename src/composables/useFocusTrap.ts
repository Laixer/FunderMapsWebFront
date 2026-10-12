import { watch, onBeforeUnmount, type Ref, nextTick } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

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
  let previouslyFocused: HTMLElement | null = null

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return []
    return Array.from(containerRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter(el => el.offsetParent !== null)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    const focusable = getFocusableElements()
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function activate() {
    previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', handleKeydown)

    nextTick(() => {
      const focusable = getFocusableElements()
      // A dialog with a form starts in its first field; the first focusable
      // element as such is the close button in the header.
      const first = focusable.find(el => el.matches('input, select, textarea')) ?? focusable[0]
      first?.focus()
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown)
    previouslyFocused?.focus()
    previouslyFocused = null
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
