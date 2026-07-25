import { type FilterSpecification, type LayerSpecification } from "maplibre-gl"

// Our layer configs (config/layers/*.json) are always data layers, never
// background — background layers lack filter/source, which the plain
// LayerSpecification union would otherwise forbid accessing.
type DataLayerSpecification = Exclude<LayerSpecification, { type: 'background' }>
import { storeToRefs } from "pinia"
import { useFiltersStore } from "@/store/filters"
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