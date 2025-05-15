import { computed, type ShallowRef, shallowRef } from 'vue';
import { defineStore } from 'pinia';

import type { IUser } from '@/datastructures/interfaces';
import api from '@/services/api';
import { hasNonExpiredToken, getClaimFromAccessToken, removeAccessToken, storeAccessToken } from '@/services/jwt';

import { useMapsetStore } from '@/store/mapsets';
import { useOrgsStore } from '@/store/orgs';
import { useMetadataStore } from './metadata';

// TODO: This store should keep the access token in memory, and use something like pinia-plugin-persistedstate
// to persist the access token in localStorage.

/**
 * Pinia store definition for session management.
 * Encapsulates state and actions for user authentication and session data.
 *
 * @returns {object} An object containing reactive state and functions for session management.
 * @property {ShallowRef<IUser | null>} currentUser - The current logged-in user or null.
 * @property {ComputedRef<boolean>} isAuthenticated - Whether a user is authenticated.
 * @property {Function} authenticateFromAccessToken - Attempts to authenticate using a stored access token.
 * @property {Function} login - Logs in a user with email and password.
 * @property {Function} logout - Logs out the current user and clears session data.
 */
export const useSessionStore = defineStore('session', () => {
  /**
   * Reactive reference to the current user's basic information.
   * This does not include detailed profile information.
   */
  const currentUser: ShallowRef<IUser | null> = shallowRef(null);

  /**
   * Computed property indicating whether a user is currently authenticated.
   * Authentication is determined by the presence of `currentUser` data.
   */
  const isAuthenticated = computed<boolean>(() => currentUser.value !== null);

  /**
   * Sets the `currentUser`'s name based on the 'name' claim from the JWT access token.
   * If the claim is not present, a default name 'Anoniem' is used.
   */
  const setUserNameFromToken = (): void => {
    const username = getClaimFromAccessToken('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name');

    if (username) {
      currentUser.value = {
        name: username.toString(),
      };
    } else {
      // TODO: What if we got a user with no name?
      currentUser.value = {
        name: 'Anoniem',
      };
    }
  };

  /**
   * Attempts to authenticate the user by checking for a non-expired access token in localStorage.
   * If a valid token exists, the user's name is set from the token. Otherwise, performs a logout.
   * Note: This function is intended for synchronous execution, e.g., during app initialization.
   */
  const authenticateFromAccessToken = (): void => {
    if (hasNonExpiredToken()) {
      setUserNameFromToken();
    } else {
      // Clean up
      logout();
    }
  };

  /**
   * Asynchronously logs in a user with the provided email and password.
   * On successful login, stores the access token and sets the user's name.
   * On failure, logs the error, attempts to clean up by logging out, and re-throws the error.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<void>} A promise that resolves on successful login or rejects on failure.
   * @throws Will re-throw any error encountered during the API call or subsequent cleanup.
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.auth.login(email, password);
      storeAccessToken(response.token);
      setUserNameFromToken();
    } catch (e) {
      console.error('Login failed:', e); // It's good practice to log the error

      // Clean up a partial success if need be
      // The logout function will now handle its own internal errors by logging them.
      logout();

      throw e; // pass on the unhappy news
    }
  };

  /**
   * Logs out the current user.
   * This involves removing the access token, clearing user-specific data from related stores
   * (mapsets, organizations, metadata), and resetting `currentUser` to null.
   * Each cleanup step will attempt to execute, and any errors will be logged.
   */
  const logout = (): void => {
    const mapsetStore = useMapsetStore();
    const orgsStore = useOrgsStore();
    const metadataStore = useMetadataStore();

    try {
      removeAccessToken();
    } catch (error) {
      console.error('Logout: Error removing access token:', error);
    }

    try {
      mapsetStore.removePrivateMapsets();
    } catch (error) {
      console.error('Logout: Error removing private mapsets:', error);
    }

    try {
      orgsStore.removeOrgs();
    } catch (error) {
      console.error('Logout: Error removing orgs:', error);
    }

    currentUser.value = null;

    try {
      // clear meta data
      // after clearing user, to prevent api call
      metadataStore.clear();
    } catch (error) {
      console.error('Logout: Error clearing metadata:', error);
    }
  };

  return {
    currentUser,
    isAuthenticated,
    authenticateFromAccessToken,
    login,
    logout,
  };
});