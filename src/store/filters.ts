

import { type Ref, ref } from "vue";
import { defineStore } from "pinia";

/**
 * Ownership filter
 */
const applyOwnershipFilter: Ref<boolean> = ref(false)



function useFilters() {
  return {
    applyOwnershipFilter
  }
}

export const useFiltersStore = defineStore(
  'Filters',
  useFilters
)