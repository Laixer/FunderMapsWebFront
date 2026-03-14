import { computed, type ShallowRef, shallowRef } from 'vue';
import { defineStore } from 'pinia';

import type { IUser } from '@/datastructures/interfaces';
import api from '@/services/api';
import { hasValidToken, getClaimFromAccessToken, removeAccessToken, storeAccessToken } from '@/services/jwt';
import router from '@/router';

import { useMapsetStore } from '@/store/mapsets';
import { useOrgsStore } from '@/store/orgs';
import { useMetadataStore } from './metadata';

export const useSessionStore = defineStore('session', () => {

  const currentUser: ShallowRef<IUser | null> = shallowRef(null);

  const isAuthenticated = computed<boolean>(() => currentUser.value !== null);

  /**
   * Sets currentUser from the JWT name claim.
   */
  const setUserNameFromToken = (): void => {
    const username = getClaimFromAccessToken('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name');
    currentUser.value = { name: username ? username.toString() : 'Anoniem' };
  };

  /**
   * Try to restore the session from a stored access token.
   */
  const authenticateFromAccessToken = (): void => {
    if (hasValidToken()) {
      setUserNameFromToken();
    } else {
      logout();
    }
  };

  /**
   * Log in with email and password.
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.auth.login(email, password);
      storeAccessToken(response.token);
      setUserNameFromToken();
    } catch (e) {
      console.error('Login failed:', e);
      logout();
      throw e;
    }
  };

  /**
   * Log out: clear token, user state, and dependent stores.
   */
  const logout = (): void => {
    stopTokenRefreshInterval();
    removeAccessToken();
    currentUser.value = null;

    useMapsetStore().removePrivateMapsets();
    useOrgsStore().removeOrgs();
    useMetadataStore().clear();
    sessionStorage.clear();
  };


  // **************************************************************************
  //  Token refresh interval
  // **************************************************************************

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const startTokenRefreshInterval = (): void => {
    stopTokenRefreshInterval();
    refreshInterval = setInterval(refreshAccessToken, 10 * 60 * 1000);
  };

  const stopTokenRefreshInterval = (): void => {
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  /**
   * Refresh the access token. On failure, log out and redirect to login.
   */
  const refreshAccessToken = async (): Promise<void> => {
    if (!hasValidToken()) return;

    try {
      const response = await api.auth.refresh();
      storeAccessToken(response.token);
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      logout();
      router.push({ name: 'login' });
    }
  };


  return {
    currentUser,
    isAuthenticated,
    authenticateFromAccessToken,
    login,
    logout,
    refreshAccessToken,
    startTokenRefreshInterval,
    stopTokenRefreshInterval,
  };
});
