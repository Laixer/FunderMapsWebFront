// Opaque bearer token storage. The TS API uses Better Auth, which issues
// session tokens that aren't JWTs — they're random opaque strings. There's
// no client-side decode, no exp check; if the server rejects with 401, we
// redirect to login. Replaces the old jwt.ts.

const access_token_key = 'access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(access_token_key);
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

export function removeAccessToken(): void {
  localStorage.removeItem(access_token_key);
}
