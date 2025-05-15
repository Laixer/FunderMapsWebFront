import { type Ref, ref } from "vue";
import { defineStore } from "pinia";

/**
 * Manages filter states for the application.
 *
 * @state applyOwnershipFilter - Toggles the ownership filter.
 */
export const useFiltersStore = defineStore('filters', () => {
  const applyOwnershipFilter: Ref<boolean> = ref(false);

  return {
    applyOwnershipFilter,
  };
});