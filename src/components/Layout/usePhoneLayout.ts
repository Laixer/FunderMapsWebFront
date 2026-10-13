import { useMediaQuery } from '@vueuse/core'

/**
 * The one breakpoint of the phone layout: narrower than Tailwind's `md`.
 *  The stylesheets say the same with `@media (width < 48rem)`, the templates
 *  with `max-md:` / `md:`. From 48rem (768px) up nothing of it applies.
 */
export const PHONE_MEDIA_QUERY = '(width < 48rem)'

/**
 * Whether the window is a phone's: the side bars then open as a full-width
 *  layer over the map instead of beside it.
 */
export const usePhoneLayout = function usePhoneLayout() {
  return useMediaQuery(PHONE_MEDIA_QUERY)
}
