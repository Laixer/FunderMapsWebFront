import { type Ref, ref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import api from "@/services/api";
import { useSessionStore } from '@/store/session';
import { useDebounceFn } from "@vueuse/core";

// TODO; This store could benefit from pinia-plugin-persistedstate

/**
 * Defines the type for individual metadata values.
 * Can be any serializable JSON value.
 */
type MetadataValue = any; // Using 'any' for flexibility with localStorage and unknown API response structures.

/**
 * Defines the type for the metadata object, a record of string keys to MetadataValues.
 */
type MetadataObject = Record<string, MetadataValue>;

/**
 * @module store/metadata
 * @description Pinia store for managing application-specific metadata.
 * This store handles the retrieval and persistence of metadata, adapting its behavior
 * based on user authentication status. For authenticated users, metadata is synchronized
 * with a backend API. For guest users, metadata is stored in `localStorage`.
 */
export const useMetadataStore = defineStore('metadata', () => {
  const metadataState: Ref<MetadataObject> = ref({});
  const isAvailable: Ref<boolean> = ref(false);

  const sessionStore = useSessionStore();
  const { isAuthenticated } = storeToRefs(sessionStore);

  const retrieve = async (): Promise<void> => {
    try {
      if (!isAuthenticated.value) {
        isAvailable.value = true;
        return;
      }

      const response: MetadataObject | null | undefined = await api.metadata.getMetadata();
      if (response) {
        metadataState.value = response;
      } else {
        metadataState.value = {}; // Ensure it's an object if API returns null/undefined
      }
      isAvailable.value = true;
    } catch (error) {
      console.error("Failed to retrieve metadata:", error);
      // Even on error, mark as available so the app doesn't hang,
      // allowing potential fallback to localStorage or an empty state.
      isAvailable.value = true;
    }
  };

  /**
   * Persists the current `metadataState` to the backend API.
   * This operation is debounced to prevent excessive API calls.
   * It only proceeds if the user is authenticated.
   * @async
   * @returns {Promise<void>} A promise that resolves when the metadata is successfully sent or if not authenticated.
   */
  const storeToApi = useDebounceFn(async (): Promise<void> => {
    if (isAuthenticated.value) {
      try {
        // Assume api.metadata.setMetadata(data: MetadataObject) returns Promise<void>
        await api.metadata.setMetadata(metadataState.value);
      } catch (error) {
        console.error("Failed to store metadata to API:", error);
      }
    }
  }, 500);

  /**
   * Retrieves a metadata item by its key.
   * If the user is authenticated, it reads from the in-memory `metadataState`.
   * If not authenticated, it reads from `localStorage`. Values from `localStorage`
   * are attempted to be parsed as JSON; if parsing fails, the raw string is returned.
   * @param {string} name - The key of the metadata item.
   * @returns {MetadataValue | undefined} The value of the metadata item, or `undefined` if not found.
   */
  const getItem = (name: string): MetadataValue | undefined => {
    if (!isAuthenticated.value) {
      const value = localStorage.getItem(name);
      if (value !== null) { // Explicitly check for null
        try {
          return JSON.parse(value);
        } catch (err) {
          // If JSON.parse fails, it might be a plain string value
          return value;
        }
      }
      return undefined; // Item not found in localStorage
    } else {
      return metadataState.value[name]; // Returns undefined if key doesn't exist
    }
  };

  /**
   * Sets a metadata item with a given key and value.
   * If the user is authenticated, it updates the in-memory `metadataState` and triggers
   * a debounced call to `storeToApi`.
   * If not authenticated, it writes to `localStorage`. Non-string values are stringified.
   * @param {string} name - The key of the metadata item.
   * @param {MetadataValue} value - The value to set for the metadata item.
   * @returns {void}
   */
  const setItem = (name: string, value: MetadataValue): void => {
    if (!isAuthenticated.value) {
      const valueToStore: string = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(name, valueToStore);
    } else {
      metadataState.value[name] = value;
      storeToApi(); // Debounced call to persist to API
    }
  };

  /**
   * Removes a metadata item by its key.
   * If the user is authenticated, it deletes the item from the in-memory `metadataState`
   * and triggers a debounced call to `storeToApi`.
   * If not authenticated, it removes the item from `localStorage`.
   * @param {string} name - The key of the metadata item to remove.
   * @returns {void}
   */
  const removeItem = (name: string): void => {
    if (!isAuthenticated.value) {
      localStorage.removeItem(name);
    } else {
      delete metadataState.value[name];
      storeToApi(); // Debounced call to persist to API
    }
  };

  /**
   * Clears all metadata.
   * This action clears all items from `localStorage` (regardless of authentication status).
   * Note: `localStorage.clear()` affects the entire domain, not just items set by this store.
   * It also resets the in-memory `metadataState` to an empty object.
   * If the user is authenticated, it triggers a debounced call to `storeToApi` to persist
   * the cleared state to the backend.
   * @returns {void}
   */
  const clear = (): void => {
    localStorage.clear();
    metadataState.value = {};
    storeToApi();
  };

  return {
    isAvailable,
    metadata: metadataState,
    getItem,
    setItem,
    removeItem,
    clear,
    retrieve,
    storeToApi,
  };
});