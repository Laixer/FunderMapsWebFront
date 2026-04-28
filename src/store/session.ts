import { computed, ref, type ShallowRef, shallowRef } from 'vue';
import { defineStore } from 'pinia';

import type { IUser } from '@/datastructures/interfaces';
import api from '@/services/api';
import { hasToken, removeAccessToken, storeAccessToken } from '@/services/token';

import { useMapsetStore } from '@/store/mapsets';
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

  const organizations = computed(() => currentUser.value?.organizations ?? []);

  // The org the user is currently acting as. Defaults to the first org on
  // load and survives until logout. Drives the ownership filter on the map
  // and the "is this report owned by me" check on inquiry downloads.
  const selectedOrgId = ref<string | null>(null);

  const selectedOrg = computed(() =>
    organizations.value.find(o => o.id === selectedOrgId.value) ?? null,
  );

  const selectOrgById = (id: string): void => {
    if (organizations.value.some(o => o.id === id)) {
      selectedOrgId.value = id;
    }
  };

  const isOrgAvailable = (id: string | null | undefined): boolean =>
    !!id && organizations.value.some(o => o.id === id);

  // Tracks the in-flight /me request so logout (or a fresh login as someone
  // else) can cancel it. Without this, a late /me response could land its
  // profile under whatever session is now active — the hasToken() guard
  // catches the logout case but not user-A-then-user-B re-login.
  let inflightController: AbortController | null = null;

  /**
   * Fetch the user profile + organizations from /api/user/me. The request
   * is bound to a fresh AbortController so logout/re-login can cancel it.
   */
  const loadUser = async (): Promise<void> => {
    inflightController?.abort();
    const controller = new AbortController();
    inflightController = controller;

    try {
      const { profile, organizations: orgs } = await api.userprofile.getMe(controller.signal);
      if (controller.signal.aborted || !hasToken()) return;
      currentUser.value = {
        name: displayName(profile),
        email: profile.email,
        organizations: orgs,
      };
      if (selectedOrgId.value === null && orgs.length > 0) {
        selectedOrgId.value = orgs[0].id;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.error('Failed to load user profile:', e);
      if (hasToken()) logout();
    } finally {
      if (inflightController === controller) inflightController = null;
    }
  };

  /**
   * Try to restore the session from a stored access token. The token is
   * opaque — we can't validate it client-side, so we ask /me. To avoid a
   * race with route guards (which redirect to /login when isAuthenticated
   * is false), set currentUser optimistically based on token presence and
   * then refine when /me responds. If /me rejects, the token was bad and
   * we log out.
   */
  const authenticateFromAccessToken = async (): Promise<void> => {
    if (!hasToken()) {
      logout();
      return;
    }
    currentUser.value = { name: 'Anoniem', email: '', organizations: [] };
    await loadUser();
  };

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
    // Cancel any /me request still in flight before tearing down state.
    inflightController?.abort();
    inflightController = null;

    // Server-side invalidation is best-effort — if it fails (network error,
    // expired session) we still want to log out client-side.
    try { await api.auth.signOut(); } catch { /* swallow */ }

    removeAccessToken();
    currentUser.value = null;
    selectedOrgId.value = null;

    useMapsetStore().removePrivateMapsets();
    useMetadataStore().clear();
    sessionStorage.clear();
  };

  return {
    currentUser,
    isAuthenticated,
    organizations,
    selectedOrgId,
    selectedOrg,
    selectOrgById,
    isOrgAvailable,
    authenticateFromAccessToken,
    login,
    logout,
  };
});
