/**
 * Better Auth client for the flows that need the browser's WebAuthn API
 * (passkeys). Everything else goes through the small fetch wrapper in
 * ./authApi — same endpoints, same cookie.
 *
 * A passkey belongs to fundermaps.com (the API's PASSKEY_RP_ID), not to the
 * page's host, so one made on the old login app (auth.fundermaps.com) works
 * here too; the API must list this origin in PASSKEY_ORIGIN.
 */
import { createAuthClient } from 'better-auth/client'
import { passkeyClient } from '@better-auth/passkey/client'

import { apiBasePath } from '@/config'

export const authClient = createAuthClient({
  baseURL: apiBasePath,
  basePath: '/api/auth',
  fetchOptions: { credentials: 'include' },
  plugins: [passkeyClient()],
})
