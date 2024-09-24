import { FilterSpecification, LayerSpecification } from "mapbox-gl"
import { storeToRefs } from "pinia"
import { useFiltersStore } from "@/store/filters"
import { useOrgsStore } from "@/store/orgs"

export const useOwnershipFilter = function useOwnershipFilter() {

  const { 
    selectedOrg
  } = storeToRefs(useOrgsStore())

  const {
    applyOwnershipFilter: applyOwnershipFilterToggle
  } = storeToRefs(useFiltersStore())

  const applyOwnershipFilterToLayerSpecification = function applyOwnershipFilterToLayerSpecification(    
    specification: LayerSpecification
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
      ]
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