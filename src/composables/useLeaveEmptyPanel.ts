import { watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * A report panel (onderzoek, herstel, incidenten) of a pand without such a
 * report has nothing to show. The address of the page then becomes that of
 * the pand, which brings the main panel back (Layout/usePanelRouting).
 *
 * Checked when the panel is created too, not only when the answer comes in:
 * on a direct link the reports can be there before the panel exists (the side
 * bar waits for the session), and the panel then stayed open and empty.
 *
 * replace, not push: an address with nothing behind it is not a page to go
 * Back to. With push, Back brought the empty panel up again.
 *
 * @param hasNothingToShow - The reports of the pand are in, and there are none
 * @param slug - The name of the panel in the address (/building/<id>/<slug>)
 */
export function useLeaveEmptyPanel(hasNothingToShow: Ref<boolean>, slug: string) {
  const route = useRoute()
  const router = useRouter()

  watch(
    // Only while the address shows this panel: the panel stays in the page,
    // out of sight, after the user has gone back to the main panel
    () => hasNothingToShow.value && route.name === 'building-panel' && route.params.panel === slug,
    (leave) => {
      if (! leave) return

      router.replace({
        name: 'building',
        params: {
          mapsetId: route.params.mapsetId,
          buildingId: route.params.buildingId,
        },
        query: route.query,
      })
    },
    { immediate: true }
  )
}
