import { type FilterSpecification, type LayerSpecification, type Map } from "maplibre-gl"
import { type MaybeRef, onBeforeUnmount, shallowRef, watch } from "vue"
import { useDebounceFn } from "@vueuse/core"

// Our layer configs (config/layers/*.json) are always data layers, never
// background — background layers lack filter/source, which the plain
// LayerSpecification union would otherwise forbid accessing.
type DataLayerSpecification = Exclude<LayerSpecification, { type: 'background' }>
import { storeToRefs } from "pinia"
import { useFiltersStore } from "@/store/filters"
import { useMapsetStore } from "@/store/mapsets"
import { useSessionStore } from "@/store/session"

export const useOwnershipFilter = function useOwnershipFilter() {

  const { selectedOrg } = storeToRefs(useSessionStore())

  const {
    applyOwnershipFilter: applyOwnershipFilterToggle
  } = storeToRefs(useFiltersStore())

  const applyOwnershipFilterToLayerSpecification = function applyOwnershipFilterToLayerSpecification(    
    specification: DataLayerSpecification
  ) {
    // Don't add ownership filtering if org name is not available or toggle is off
    if (! selectedOrg?.value?.name || ! applyOwnershipFilterToggle.value) {
      return
    }

    const ownershipFilter = [
      'match',
      ['get', 'owner'],
      selectedOrg?.value?.name,
      true,
      false
    ] as FilterSpecification
    
    if (specification.filter) {
      specification.filter = [
        'all',
        specification.filter,
        ownershipFilter
      ] as FilterSpecification
    } else {
      specification.filter = ownershipFilter
    }

    return specification
  }

  return {
    applyOwnershipFilterToLayerSpecification,
    applyOwnershipFilterToggle
  }
}

/**
 * Tells the filters store when the ownership filter leaves nothing of what is
 * in view, so that the switch can say so: for most organisations no building
 * matches, and the map went empty without a word.
 *
 * What the filter matches is not decided here. This only looks at what the
 * map has drawn, and only once the map has come to rest (its "idle" event):
 * while it moves or loads tiles nothing is concluded and the message stays as
 * it was, so it does not flicker.
 */
export const useOwnershipFilterNotice = function useOwnershipFilterNotice(
  Map: MaybeRef<Map | null | undefined>
) {
  const mapInstance = shallowRef(Map)

  const { activeMapset } = storeToRefs(useMapsetStore())
  const { selectedOrg } = storeToRefs(useSessionStore())
  const { applyOwnershipFilter, noOwnedBuildingsInView } = storeToRefs(useFiltersStore())

  /**
   * The filter only does something for a user with an organisation
   */
  const isFiltering = function isFiltering(): boolean {
    return !! applyOwnershipFilter.value && !! selectedOrg.value?.name
  }

  const check = function check() {
    const map = mapInstance.value
    if (! map) return

    if (! isFiltering()) {
      noOwnedBuildingsInView.value = false
      return
    }

    // Still moving or loading: wait for the next time the map is at rest
    if (! map.loaded() || ! map.areTilesLoaded() || map.isMoving()) return

    // The layers of the mapset that draw at this zoom: switched on in the
    // legend, and zoomed in far enough for the layer and for its tiles
    const zoom = map.getZoom()
    const drawing = (activeMapset.value?.layerSet ?? [])
      .map(layer => layer.id)
      .filter(layerId => {
        const layer = map.getLayer(layerId)
        if (! layer || layer.isHidden(zoom)) return false

        const source = map.getSource(layer.source) as { minzoom?: number } | undefined
        return zoom >= (source?.minzoom ?? 0)
      })

    // Zoomed out too far (or everything unticked): the map is empty with or
    // without the filter, and has nothing to say about ownership
    if (drawing.length === 0) {
      noOwnedBuildingsInView.value = false
      return
    }

    // A layer only draws what passes its filter
    noOwnedBuildingsInView.value = map.queryRenderedFeatures({ layers: drawing }).length === 0
  }

  const checkWhenSettled = useDebounceFn(check, 200)

  watch(
    () => mapInstance.value,
    (map) => map?.on('idle', checkWhenSettled),
    { immediate: true }
  )

  // Off: the message goes at once. On: the filters reach the layers a moment
  // later; a repaint makes sure the map reports "idle" again after that.
  watch(
    () => isFiltering(),
    (filtering) => {
      if (! filtering) {
        noOwnedBuildingsInView.value = false
      } else {
        mapInstance.value?.triggerRepaint()
      }
    }
  )

  onBeforeUnmount(() => {
    mapInstance.value?.off('idle', checkWhenSettled)
    noOwnedBuildingsInView.value = false
  })
}
