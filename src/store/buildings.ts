import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useSessionStore } from './session';

/**
 * Pinia store for managing the currently selected building's state.
 *
 * @state buildingId - The ID of the selected building.
 * @getter hasSelectedBuilding - True if a building is selected.
 * @action {(id: string) => void} setBuildingId - Sets the selected building ID.
 * @action {() => void} clearBuildingId - Clears the selected building ID.
 */
export const useBuildingStore = defineStore('buildings', () => {
  /**
   * The ID of the currently selected building.
   * Null if no building is selected.
   */
  const buildingId = ref<string | null>(null);

  /**
   * Indicates whether a building is currently selected.
   * True if a building ID is set, false otherwise.
   */
  const hasSelectedBuilding = computed(() => buildingId.value !== null);

  /**
   * Selects a building by its ID.
   * @param {string} id - The ID of the building to select.
   */
  const setBuildingId = (id: string): void => {
    buildingId.value = id;
  };

  /**
   * Clears the currently selected building.
   * Sets `buildingId` to null.
   */
  const clearBuildingId = (): void => {
    buildingId.value = null;
  };

  // Get the session store instance to access its reactive properties
  const sessionStore = useSessionStore();

  // Automatically clear the selected building when the user logs out.
  watch(
    // Watch isAuthenticated from the session store
    () => sessionStore.isAuthenticated,
    (isUserAuthenticated: boolean) => {
      if (!isUserAuthenticated) {
        clearBuildingId();
      }
    }
  );

  return {
    buildingId,
    hasSelectedBuilding,
    setBuildingId,
    clearBuildingId,
  };
});