import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Added ref and computed
import { IOrg } from '@/datastructures/interfaces';
import api from '@/services/api';

/**
 * Pinia store for managing organizations.
 * This store handles fetching, selecting, and managing organization data.
 */
export const useOrgsStore = defineStore('orgs', () => {
  const isLoadingOrgs = ref(false);
  const availableOrgs = ref<IOrg[]>([]);
  const selectedOrgId = ref<string | null>(null);

  /**
   * Checks if there are any available organizations.
   *
   * @returns {boolean} True if organizations are available, false otherwise.
   */
  const hasAvailableOrgs = computed((): boolean => {
    return availableOrgs.value.length > 0;
  });

  /**
   * Checks if an organization has been selected.
   *
   * @returns {boolean} True if an organization is selected, false otherwise.
   */
  const hasSelectedOrg = computed((): boolean => {
    return selectedOrgId.value !== null;
  });

  /**
   * Retrieves an organization by its ID.
   *
   * @param {string} id - The ID of the organization to retrieve.
   * @returns {IOrg | null} The IOrg object or null if not found or if no organizations are available.
   */
  const getOrgById = (id: string): IOrg | null => {
    if (!availableOrgs.value || availableOrgs.value.length === 0) {
      return null;
    }
    return availableOrgs.value.find((org: IOrg) => org.id === id) || null;
  };

  /**
   * Checks if a specific organization ID is available in the list of organizations.
   *
   * @param {string} id - The ID of the organization to check.
   * @returns {boolean} True if the organization is available, false otherwise.
   */
  const isOrgAvailable = (id: string): boolean => {
    return getOrgById(id) !== null;
  };

  /**
   * The currently selected organization object.
   *
   * @returns {IOrg | null} The selected IOrg object, or null if no organization is selected or found.
   */
  const selectedOrg = computed((): IOrg | null => {
    if (!hasSelectedOrg.value || selectedOrgId.value === null) {
      return null;
    }
    return getOrgById(selectedOrgId.value);
  });

  /**
   * Selects an organization by its ID if it exists.
   *
   * @param {string} id - The ID of the organization to select.
   */
  function selectOrgById(id: string): void {
    if (getOrgById(id) !== null) {
      selectedOrgId.value = id;
    }
  }

  /**
   * Loads the list of available organizations from the API.
   * If organizations are loaded and available, selects the first one by default.
   * @async
   */
  async function loadAvailableOrgs(): Promise<void> {
    isLoadingOrgs.value = true;
    try {
      const orgsData: IOrg[] = await api.org.getOrgs();
      availableOrgs.value = orgsData;
      if (hasAvailableOrgs.value && availableOrgs.value.length > 0) {
        selectOrgById(availableOrgs.value[0].id);
      }
    } catch (error) {
      console.error('Failed to load available organizations:', error);
      throw error; // Re-throw the error for upstream handling
    } finally {
      isLoadingOrgs.value = false;
    }
  }

  /**
   * Clears the list of available organizations and the selected organization ID.
   * Typically used on user logout.
   */
  function removeOrgs(): void {
    availableOrgs.value = [];
    selectedOrgId.value = null;
  }

  return {
    isLoadingOrgs,
    availableOrgs,
    selectedOrgId,
    hasAvailableOrgs,
    hasSelectedOrg,
    getOrgById,
    isOrgAvailable,
    selectedOrg,
    selectOrgById,
    loadAvailableOrgs,
    removeOrgs,
  };
});