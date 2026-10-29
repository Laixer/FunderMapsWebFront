# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs `vue-tsc` type checking then `vite build`)
- **Preview production build:** `pnpm preview`
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Type check only:** `npx vue-tsc --noEmit`

No test framework is configured. Uses pnpm as package manager.

## Architecture

FunderMaps is a Vue 3 + TypeScript + Vite application for building foundation/subsidence analysis with MapLibre map visualization. It uses `<script setup>` SFCs, Pinia for state management, and Tailwind CSS v4 for styling (via `@tailwindcss/vite` plugin, config in `src/style.css` `@theme` block). Custom CSS lives in `src/styles/` (imported via `src/main.ts`) using native CSS nesting.

### Source Layout (`src/`)

- **`router/`** - Vue Router config. Routes: `/login`, `/forgot-password`, `/reset-password`, `/account` (the login pages; `/forgotten` and `/reset/:resetKey?` redirect), `/` (home), `/map/:mapsetId`, `/map/:mapsetId/building/:buildingId(/:panel)`
- **`store/`** - Pinia stores. Core: `session` (auth), `main` (UI state/modals), `buildings` (selected building), `mapsets` (available mapsets), `layers` (visibility, persisted to sessionStorage), `filters` (ownership), `metadata` (user prefs). Building-specific substores in `store/building/` (analysis, geolocations, incidents, inquiries, recovery, statistics, subsidence)
- **`services/`** - API layer. `apiClient.ts` is the base HTTP client; it sends the session cookie (`credentials: 'include'`) and, on a `401`, signals the shell through `authEvents.ts`. `auth.ts` holds login, passkeys, password reset and sign-out (`authApi.ts` = the fetch wrapper for `/api/auth/*`, `authClient.ts` = the Better Auth client for passkeys). Nothing is stored in the browser. Endpoint modules in `services/api/` (auth, building, mapset, metadata, pdf, userprofile)
- **`components/Map/`** - Map integration. `Map.vue` is the main map component. Composables (`use*.ts`) handle layers, sources, events, markers, clustering, geo-fencing, ownership filters, position tracking, and administrative boundaries
- **`config/layers/`** - JSON layer definitions for map styling (MapLibre style spec) (30+ files for foundation types, incidents, risk assessments, etc.)
- **`datastructures/`** - TypeScript interfaces, enums, and data classes (Location, Controls, analysis/report types)
- **`directives/`** - Custom Vue directives (line clamping)
- **`utils/`** - Helpers for validation, sessionStorage, string manipulation

### Path Aliases

- `@` → `./src`
- `@assets` → `./src/assets`

### Environment Variables

`VITE_` prefixed env vars the code reads (no `.env` file in repo):
- `VITE_FUNDERMAPS_URL` - API base URL
- `VITE_FUNDERMAPS_TILESERVER_URL` - Martin tileserver base URL (the vector sources' TileJSON)
- `VITE_PDOK_LOCATIONSERVICE` - PDOK Locatieserver base URL (address search)
- `VITE_FUNDERMAPS_BASE_STYLE` - base map style, default `https://tiles.fundermaps.com/style/fundermaps-basemap`
- `VITE_DEFAULT_MAPSET_ID` - Default mapset UUID (has a default)
- `VITE_DEFAULT_LAYERS` - Comma-separated default visible layer names (has a default)
- `VITE_FUNDERMAPS_NUMBER_LAYER` - layer the building-number labels are inserted before (optional)
- `VITE_GIT_COMMIT_HASH` - Auto-injected at build time from git

Not read any more: `VITE_FUNDERMAPS_TILES_URL` (the static tileset bucket; tiles come from the tileserver).

### Authentication Flow

The session is the **Better Auth cookie on the API origin**, shared by every `*.fundermaps.com` app; there is no token and nothing in localStorage. (Until October 2026 this was OIDC with a bearer token; `services/oidc.ts` and `services/token.ts` are gone.) The map is public: a visitor without a session is a guest, not an error.

**The map has its own login pages since 2026-10-29** (moved from FunderMapsAuth, auth.fundermaps.com, which goes): `/login` (password, or a passkey — also offered in the e-mail field's autocomplete), `/forgot-password`, `/reset-password` (the API's reset mail links back here with `?token=`), and `/account` (passkeys, sign-out; needs a session), all inside `components/AuthShell.vue`. The paths are the old login app's, so auth.fundermaps.com can forward here path for path. `loginRedirect()` goes to `/login?redirect=<this page>`; the login page sends the user back there (`safeRedirect`: this map or another `*.fundermaps.com` app), else to the map, and forwards someone who is logged in already once a minute at most (no bounce loop). Passkeys belong to `fundermaps.com` (the API's `PASSKEY_RP_ID`), so the ones made on the old login app work here; the API must list this origin in `PASSKEY_ORIGIN`. `logoutRedirect()` posts `/api/auth/sign-out`, then reloads the map as a guest. A `401` on a call that needs a session makes `apiClient.ts` emit `authExpired`, and the shell sends the user to log in again. The `session` store handles `/me` and the role flags. Changing a password while logged in happens in `PasswordModal` (`/auth/change-password`).

### Map Layer System

Mapsets define which layers are available. Layer configs in `config/layers/` define MapLibre styling. The `layers` store tracks visibility per mapset. Composables in `components/Map/` dynamically add/remove layers and sources based on the active mapset. Geographic fencing filters data by municipality/district/neighborhood.

### Key Libraries

- **maplibre-gl** - Map rendering (FunderMaps basemap style; source of truth in FunderMapsWorker `tileserver/styles/`)
- **chart.js** + chartjs-plugin-trendline - Data visualization
- **zod** - Schema validation
- **vite-svg-loader** - Import SVGs as Vue components

### Backend Context

This frontend consumes the FunderMaps API backed by a PostgreSQL/PostGIS database. Map tiles are generated by the FunderMaps SDK (`~/Projects/FunderMapsSDK`) pipeline: PostGIS → GPKG → GeoJSON → Tippecanoe vector tiles → S3. The API serves building analysis, foundation data, incident/inquiry/recovery reports, subsidence measurements, and PDF reports. Mapsets are collections of layers with geographic fencing and access control.

### Node Version

Requires Node.js ^22.0.0.
