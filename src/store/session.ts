import { computed, ref, type ShallowRef, shallowRef } from 'vue';
import { defineStore } from 'pinia';

import type { IUser } from '@/datastructures/interfaces';
import api from '@/services/api';
import { APITokenError } from '@/services/apiClient';

import { useMapsetStore } from '@/store/mapsets';
import { useMetadataStore } from './metadata';

// Build a display name from /me's given_name + family_name; fall back to
// email, then "Anoniem". The session is a cookie, so who is signed in is
// always a question for the server.
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

  const isOrgAvailable = (id: string | null | undefined): boolean =>
    !!id && organizations.value.some(o => o.id === id);

  // Tracks the in-flight /me request so logout can cancel it. Without this,
  // a late /me response could land its profile under whatever session is
  // now active.
  let inflightController: AbortController | null = null;

  /**
   * Fetch the user profile + organizations from /api/user/me, using the
   * session cookie. A 401 means "guest" and leaves the store empty; that is
   * the normal case for most visitors of the public map.
   */
  const loadUser = async (): Promise<void> => {
    inflightController?.abort();
    const controller = new AbortController();
    inflightController = controller;

    try {
      const { profile, organizations: orgs } = await api.userprofile.getMe(controller.signal, { quiet401: true });
      if (controller.signal.aborted) return;
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
      if (e instanceof APITokenError) return; // guest
      console.error('Failed to load user profile:', e);
      currentUser.value = null;
    } finally {
      if (inflightController === controller) inflightController = null;
    }
  };

  /**
   * Restore the session on page load: ask /me. Guests stay guests.
   */
  const authenticate = async (): Promise<void> => {
    await loadUser();
  };

  /**
   * Log out: invalidate the server session (best-effort, clears the cookie),
   * clear user state, and clear dependent stores.
   */
  const logout = async (): Promise<void> => {
    // Cancel any /me request still in flight before tearing down state.
    inflightController?.abort();
    inflightController = null;

    // Server-side invalidation is best-effort — if it fails (network error,
    // expired session) we still want to log out client-side.
    try { await api.auth.signOut(); } catch { /* swallow */ }

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
    isOrgAvailable,
    authenticate,
    logout,
  };
});
