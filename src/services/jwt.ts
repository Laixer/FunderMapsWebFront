import { type JwtPayload, jwtDecode } from "jwt-decode";


// ****************************************************************************
//  Interface
// ****************************************************************************

interface FundermapsJwtPayload extends JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string,
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string,
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string,
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string,
  "cfo": string,
  "cfor": string
}

// ****************************************************************************
//  Private
// ****************************************************************************

const access_token_key = 'access_token';

function getAccessToken(): string | null {
  return localStorage.getItem(access_token_key);
}

function decodeAccessToken(token: string): FundermapsJwtPayload {
  return jwtDecode<FundermapsJwtPayload>(token);
}

function isTokenExpired(token: string): boolean {
  const parsed = decodeAccessToken(token);
  const now = Math.round(Date.now() / 1000);
  return (parsed?.exp || 0) < now;
}


// ****************************************************************************
//  Public
// ****************************************************************************

/**
 * Whether a valid (present and non-expired) access token exists.
 */
export function hasValidToken(): boolean {
  const token = getAccessToken();
  return token !== null && !isTokenExpired(token);
}

/**
 * Return the Authorization header if a valid token exists, or null.
 */
export function getAuthHeader(): { Authorization: string } | null {
  const token = getAccessToken();
  if (token === null || isTokenExpired(token)) return null;
  return { 'Authorization': 'Bearer ' + token };
}

/**
 * Get a claim value from the stored access token.
 * Returns null if no valid token exists or the claim is missing.
 */
export function getClaimFromAccessToken(claim: string) {
  const token = getAccessToken();
  if (token === null || isTokenExpired(token)) return null;

  const parsed = decodeAccessToken(token);
  return parsed?.[claim as keyof FundermapsJwtPayload] || null;
}

/**
 * Store the access token in local storage.
 */
export function storeAccessToken(token: string): void {
  localStorage.setItem(access_token_key, token)
}

/**
 * Remove the token, ending the user session.
 */
export function removeAccessToken(): void {
  localStorage.removeItem(access_token_key)
}
