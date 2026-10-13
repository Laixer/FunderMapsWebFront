import { ref } from "vue";
import { defineStore } from "pinia";

/**
 * Manages filter states for the application.
 *
 * @state applyOwnershipFilter - Toggles the ownership filter.
 * @state noOwnedBuildingsInView - The ownership filter is on and leaves nothing of what is in view.
 */
export const useFiltersStore = defineStore('filters', () => {
  const applyOwnershipFilter = ref(false);

  /**
   * Set by the map (useOwnershipFilterNotice), shown under the switch: with
   * the filter on, a map without any building otherwise looks broken.
   */
  const noOwnedBuildingsInView = ref(false);

  return {
    applyOwnershipFilter,
    noOwnedBuildingsInView,
  };
});