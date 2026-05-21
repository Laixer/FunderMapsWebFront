// Opaque bearer token storage. The TS API uses Better Auth, which issues
// session tokens that aren't JWTs — they're random opaque strings. There's
// no client-side decode, no exp check; if the server rejects with 401, we
// redirect to login. Replaces the old jwt.ts.

const access_token_key = 'access_token';
// OIDC refresh token (rotated on every use) + id_token (for RP-logout's
// id_token_hint). The access token is short-lived (1h); on a 401 the API client
// silently refreshes via the refresh token, so the user isn't bounced to login.
const refresh_token_key = 'refresh_token';
const id_token_key = 'id_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(access_token_key);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(refresh_token_key);
}

export function getIdToken(): string | null {
  return localStorage.getItem(id_token_key);
}

export function hasToken(): boolean {
  return getAccessToken() !== null;
}

export function getAuthHeader(): { Authorization: string } | null {
  const token = getAccessToken();
  if (token === null) return null;
  return { Authorization: 'Bearer ' + token };
}

export function storeAccessToken(token: string): void {
  localStorage.setItem(access_token_key, token);
}

/** Store the full token set from an OIDC token response (rotates refresh token). */
export function storeTokens(t: {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
}): void {
  localStorage.setItem(access_token_key, t.access_token);
  if (t.refresh_token) localStorage.setItem(refresh_token_key, t.refresh_token);
  if (t.id_token) localStorage.setItem(id_token_key, t.id_token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(access_token_key);
}

/** Clear every stored token (access + refresh + id). */
export function removeTokens(): void {
  localStorage.removeItem(access_token_key);
  localStorage.removeItem(refresh_token_key);
  localStorage.removeItem(id_token_key);
}
