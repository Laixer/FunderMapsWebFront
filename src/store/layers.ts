import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { validate as uuidValidate } from 'uuid';

import { useMapsetStore } from '@/store/mapsets';
import { getItemsStartingWith } from '@/utils/sessionStorage';

// A full session storage key = prefix + mapsetId
const sessionStorageKeyPrefix = 'layer_visibility_';

/**
 * Defines the store for managing layer visibility and related settings.
 */
export const useLayersStore = defineStore('layers', () => {
  /**
   * Stores arrays of visible layer IDs, keyed by mapset ID.
   * @type {Ref<{ [key: string]: string[] }>}
   */
  const visibleLayersByMapsetId: Ref<{ [key: string]: string[] }> = ref({});

  /**
   * Indicates whether administrative boundaries are shown.
   * @type {Ref<boolean>}
   */
  const showAdministrativeBoundaries: Ref<boolean> = ref(false);

  /**
   * Indicates whether the building cluster (bouwkundige eenheid) layer is shown.
   * @type {Ref<boolean>}
   */
  const showBuildingCluster: Ref<boolean> = ref(false);

  /**
   * Resolves the mapset ID from various possible inputs.
   * Priority:
   * 1. Valid UUID provided as input.
   * 2. Identifier provided as input (resolved via `useMapsetStore`).
   * 3. Active mapset ID from `useMapsetStore`.
   * @param {string | null | undefined} mapsetIdInput - The mapset ID (UUID) or identifier to resolve.
   * @returns {string | null} The resolved mapset ID, or null if resolution fails or no mapset is active.
   */
  const resolveMapsetId = (mapsetIdInput?: string | null): string | null => {
    let resolvedMapsetId: string | null = null;

    if (mapsetIdInput) {
      if (uuidValidate(mapsetIdInput)) {
        resolvedMapsetId = mapsetIdInput;
      } else {
        // Assume it's an identifier if not a UUID
        const { getMapsetIdByIdentifier } = useMapsetStore();
        const idFromIdentifier = getMapsetIdByIdentifier(mapsetIdInput);
        resolvedMapsetId = idFromIdentifier === undefined ? null : idFromIdentifier;
      }
    }

    // If no input was provided, or if the input (identifier) didn't resolve, try the active mapset
    if (!resolvedMapsetId) {
      const { activeMapsetId } = storeToRefs(useMapsetStore());
      resolvedMapsetId = activeMapsetId.value; // This can be string | null
    }

    return resolvedMapsetId;
  };

  /**
   * Retrieves all visible layer IDs for a given mapset ID.
   * The returned list is filtered against the mapset's whitelisted layers.
   * @param {string} id - The mapset ID.
   * @returns {string[]} An array of visible layer IDs. Returns an empty array if the mapset ID is invalid or has no visible layers.
   */
  const getVisibleLayersByMapsetId = (id: string): string[] => {
    const list = visibleLayersByMapsetId.value[id] ?? [];
    if (list.length === 0) {
      return [];
    }

    const { getMapsetById } = useMapsetStore();
    const mapset = getMapsetById(id);
    const whitelistedLayerIds = mapset?.layerSet.map(layer => layer.id) || [];

    return list.filter(layerId => whitelistedLayerIds.includes(layerId));
  };

  /**
   * Retrieves all visible layer IDs for the currently active mapset.
   * @returns {string[]} An array of visible layer IDs for the active mapset. Returns an empty array if no mapset is active.
   */
  const getVisibleLayersOfActiveMapset = (): string[] => {
    const { activeMapsetId } = storeToRefs(useMapsetStore());
    return activeMapsetId.value ? getVisibleLayersByMapsetId(activeMapsetId.value) : [];
  };

  /**
   * Checks if a specific layer is visible within a given mapset context.
   * Note: This checks raw visibility state and does not consider mapset whitelisting.
   * For whitelisted visibility, combine with `getVisibleLayersByMapsetId`.
   * @param {string} layerId - The ID of the layer.
   * @param {string} mapsetId - The ID of the mapset.
   * @returns {boolean} True if the layer is marked as visible for the mapset, false otherwise.
   */
  const isLayerVisible = (layerId: string, mapsetId: string): boolean => {
    return !!visibleLayersByMapsetId.value[mapsetId]?.includes(layerId);
  };

  /**
   * Loads layer visibility information from session storage for all mapsets.
   * This is typically called once at application startup to restore previous state.
   */
  const retrieveLayerVisibilityFromSessionStorage = (): void => {
    try {
      const visibilityPerMapset = getItemsStartingWith(sessionStorageKeyPrefix);
      Object.keys(visibilityPerMapset).forEach(key => {
        const id = key.substring(sessionStorageKeyPrefix.length);
        if (id) { // Ensure id is not empty (e.g., if key was exactly the prefix)
          try {
            const parsedLayers = JSON.parse(visibilityPerMapset[key]);
            if (Array.isArray(parsedLayers) && parsedLayers.every(item => typeof item === 'string')) {
              visibleLayersByMapsetId.value[id] = parsedLayers;
            } else {
              console.warn(`Invalid layer visibility data in session storage for mapset ${id}: not an array of strings.`);
            }
          } catch (parseError) {
            console.error(`Failed to parse layer visibility for mapset ${id} from session storage:`, parseError);
          }
        }
      });
    } catch (e) {
      console.error("Failed to retrieve layer visibility information from session storage. Starting with default settings.", e);
    }
  };

  /**
   * Changes the visibility of a layer for a specific mapset and updates session storage.
   * @param {string} layerId - The ID of the layer whose visibility is to be changed.
   * @param {boolean} visibility - The new visibility state (true for visible, false for hidden).
   * @param {string | null | undefined} mapsetIdInput - The mapset ID or identifier; defaults to the active mapset if null or undefined.
   */
  const changeLayerVisibility = (layerId: string, visibility: boolean, mapsetIdInput?: string | null): void => {
    const finalMapsetId = resolveMapsetId(mapsetIdInput);

    if (!finalMapsetId) {
      console.error("Cannot change layer visibility: Missing or unresolved mapset ID.", { layerId, visibility, mapsetIdInput });
      return;
    }

    const currentVisibleForMapset = visibleLayersByMapsetId.value[finalMapsetId] ?? [];
    let futureVisibleLayers: string[];

    if (visibility) {
      // Add layer if not already present
      if (!currentVisibleForMapset.includes(layerId)) {
        futureVisibleLayers = [...currentVisibleForMapset, layerId];
      } else {
        futureVisibleLayers = [...currentVisibleForMapset]; // No change needed, already visible
      }
    } else {
      // Remove layer
      futureVisibleLayers = currentVisibleForMapset.filter(id => id !== layerId);
    }

    // Only update if there's an actual change to the list of layers for this mapset
    if (JSON.stringify(currentVisibleForMapset) !== JSON.stringify(futureVisibleLayers)) {
      visibleLayersByMapsetId.value[finalMapsetId] = futureVisibleLayers;
      try {
        sessionStorage.setItem(
          `${sessionStorageKeyPrefix}${finalMapsetId}`,
          JSON.stringify(futureVisibleLayers)
        );
      } catch (e) {
        console.error(`Failed to save layer visibility to session storage for mapset ${finalMapsetId}:`, e);
      }
    }
  };

  /**
   * Toggles the visibility of a layer for a specific mapset.
   * @param {string} layerId - The ID of the layer to toggle.
   * @param {string | null | undefined} mapsetIdInput - The mapset ID or identifier; defaults to the active mapset if null or undefined.
   */
  const toggleLayerVisibility = (layerId: string, mapsetIdInput?: string | null): void => {
    const finalMapsetId = resolveMapsetId(mapsetIdInput);

    if (!finalMapsetId) {
      console.error("Cannot toggle layer visibility: Missing or unresolved mapset ID.", { layerId, mapsetIdInput });
      return;
    }

    // Use the raw visibility state for toggling, not the whitelisted one from getVisibleLayersByMapsetId
    const isCurrentlyVisible = visibleLayersByMapsetId.value[finalMapsetId]?.includes(layerId) ?? false;
    changeLayerVisibility(layerId, !isCurrentlyVisible, finalMapsetId);
  };

  return {
    visibleLayersByMapsetId,
    showAdministrativeBoundaries,
    showBuildingCluster,
    getVisibleLayersByMapsetId,
    getVisibleLayersOfActiveMapset,
    isLayerVisible,
    retrieveLayerVisibilityFromSessionStorage,
    changeLayerVisibility,
    toggleLayerVisibility,
  };
});