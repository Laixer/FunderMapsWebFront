import { type Ref, ref, computed, watch, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';
import { useSessionStore } from './session';

/**
 * Pinia store for managing the currently selected building's state.
 *
 * @state {Ref<string | null>} buildingId - The ID of the selected building.
 * @getter {ComputedRef<boolean>} hasSelectedBuilding - True if a building is selected.
 * @action {(id: string) => void} setBuildingId - Sets the selected building ID.
 * @action {() => void} clearBuildingId - Clears the selected building ID.
 */
export const useBuildingStore = defineStore('buildings', () => {
  /**
   * The ID of the currently selected building.
   * Null if no building is selected.
   */
  const buildingId: Ref<string | null> = ref(null);

  /**
   * Indicates whether a building is currently selected.
   * True if a building ID is set, false otherwise.
   */
  const hasSelectedBuilding: ComputedRef<boolean> = computed(() => buildingId.value !== null);

  /**
   * Selects a building by its ID.
   * Updates the `buildingId` state. Optionally uses a debug ID from localStorage.
   * @param {string} id - The ID of the building to select.
   */
  const setBuildingId = (id: string): void => {
    const debugBuildingId: string | null = localStorage.getItem('debugBuildingId');
    buildingId.value = debugBuildingId || id;
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

