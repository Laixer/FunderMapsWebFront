import { ref, watch, onMounted, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuEntry { slug: string; panel: string }

// Two-way binding between the building-panel route param and the visually
// open detail panel. The component owns the panel <-> menu lookup; this
// composable owns the routing side.
export function usePanelRouting(menus: ComputedRef<MenuEntry[]>[]) {
  const route = useRoute()
  const router = useRouter()

  const selectedPanel = ref('')
  const rightPanelSlide = ref(false)

  const findPanelName = (slug: string): string | null => {
    for (const menu of menus) {
      const entry = menu.value.find(m => m.slug === slug)
      if (entry) return entry.panel
    }
    return null
  }

  const openPanel = (name: string, slug: string): void => {
    selectedPanel.value = name
    rightPanelSlide.value = true

    if (route.name !== 'building-panel' || route.params.panel !== slug) {
      router.push({
        name: 'building-panel',
        params: {
          buildingId: route.params.buildingId,
          mapsetId: route.params.mapsetId,
          panel: slug,
        },
        query: route.query,
      })
    }
  }

  const openPanelBySlug = (slug: string): void => {
    const panel = findPanelName(slug)
    if (panel) openPanel(panel, slug)
  }

  const backToMainMenu = (): void => {
    rightPanelSlide.value = false
    if (route.name === 'building-panel') {
      router.push({ name: 'building', params: route.params, query: route.query })
    }
  }

  watch(() => route.params.panel, slug => {
    if (slug) openPanelBySlug(slug as string)
  })

  onMounted(() => {
    if (route.name === 'building-panel') {
      openPanelBySlug(route.params.panel as string)
    }
  })

  return { selectedPanel, rightPanelSlide, openPanel, backToMainMenu }
}
