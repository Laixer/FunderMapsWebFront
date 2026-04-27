import { computed, type ShallowRef, shallowRef } from 'vue';
import { defineStore } from 'pinia';

import type { IUser } from '@/datastructures/interfaces';
import api from '@/services/api';
import { hasToken, removeAccessToken, storeAccessToken } from '@/services/token';

import { useMapsetStore } from '@/store/mapsets';
import { useOrgsStore } from '@/store/orgs';
import { useMetadataStore } from './metadata';

// Build a display name from /me's given_name + family_name; fall back to
// email, then "Anoniem". Better Auth tokens are opaque so the username
// can't be decoded from the bearer — we always have to ask the server.
function displayName(profile: { givenName?: string; lastName?: string; email?: string } | null): string {
  if (!profile) return 'Anoniem';
  const full = `${profile.givenName ?? ''} ${profile.lastName ?? ''}`.trim();
  return full || profile.email || 'Anoniem';
}

export const useSessionStore = defineStore('session', () => {

  const currentUser: ShallowRef<IUser | null> = shallowRef(null);

  const isAuthenticated = computed<boolean>(() => currentUser.value !== null);

  /**
   * Fetch the user profile from /api/user/me and set the display name.
   * Called after login and after restoring a saved token.
   */
  const loadUser = async (): Promise<void> => {
    try {
      const profile = await api.userprofile.getUserProfile();
      currentUser.value = { name: displayName(profile) };
    } catch (e) {
      console.error('Failed to load user profile:', e);
      logout();
    }
  };

  /**
   * Try to restore the session from a stored access token. The token is
   * opaque — we can't validate it client-side, so we ask /me. To avoid a
   * race with route guards (which redirect to /login when isAuthenticated
   * is false), set currentUser optimistically based on token presence and
   * then refine the display name when /me responds. If /me rejects, the
   * token was bad and we log out.
   */
  const authenticateFromAccessToken = async (): Promise<void> => {
    if (!hasToken()) {
      logout();
      return;
    }
    // Optimistic: token is present, treat the user as authenticated until
    // /me proves otherwise. Without this the route guard fires before /me
    // resolves and bounces the user to /login on every page reload.
    currentUser.value = { name: 'Anoniem' };
    await loadUser();
  };

  /**
   * Log in with email and password against Better Auth.
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.auth.login(email, password);
      storeAccessToken(response.token);
      await loadUser();
    } catch (e) {
      console.error('Login failed:', e);
      logout();
      throw e;
    }
  };

  /**
   * Log out: invalidate server session (best-effort), clear token + user
   * state, and clear dependent stores.
   */
  const logout = async (): Promise<void> => {
    // Server-side invalidation is best-effort — if it fails (network error,
    // expired session) we still want to log out client-side.
    try { await api.auth.signOut(); } catch { /* swallow */ }

    removeAccessToken();
    currentUser.value = null;

    useMapsetStore().removePrivateMapsets();
    useOrgsStore().removeOrgs();
    useMetadataStore().clear();
    sessionStorage.clear();
  };

  return {
    currentUser,
    isAuthenticated,
    authenticateFromAccessToken,
    login,
    logout,
  };
});
