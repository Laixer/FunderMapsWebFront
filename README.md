# FunderMaps

Web frontend for the FunderMaps platform — a building foundation and subsidence analysis tool with interactive map visualization.

Built with Vue 3, TypeScript, Vite, and MapLibre.

## Prerequisites

- Node.js ^22.0.0
- pnpm

## Setup

```sh
pnpm install
```

Create a `.env` file with the following variables:

```
VITE_FUNDERMAPS_URL=<API base URL>
VITE_FUNDERMAPS_TILESERVER_URL=<tileserver base URL, e.g. https://tiles.fundermaps.com>
VITE_PDOK_LOCATIONSERVICE=<PDOK Locatieserver base URL, for the address search>

# Optional, each has a default in the code
VITE_AUTH_URL=<login app; default https://auth.fundermaps.com>
VITE_FUNDERMAPS_BASE_STYLE=<base map style; default https://tiles.fundermaps.com/style/fundermaps-basemap>
VITE_DEFAULT_MAPSET_ID=<default mapset UUID>
VITE_DEFAULT_LAYERS=<comma-separated default visible layer names>
VITE_FUNDERMAPS_NUMBER_LAYER=<layer the building-number labels are inserted before>
```

The map is drawn with MapLibre from our own tileserver (`VITE_FUNDERMAPS_TILES_URL`
is not read any more).

## Development

```sh
pnpm dev
```

## Build

```sh
pnpm build
```

This runs type checking (`vue-tsc`) followed by the Vite production build.

## Lint and Format

```sh
pnpm lint
pnpm format
```

## Architecture

The application uses `<script setup>` single-file components, Pinia for state management, and Tailwind CSS v4 for styling. Authentication is the session cookie the FunderMaps API sets (Better Auth), shared by every `*.fundermaps.com` app; login happens in the auth app. Map layers and data sources are configured per mapset with geographic fencing.

### Source Layout

- `src/router/` - Vue Router configuration
- `src/store/` - Pinia stores (session, mapsets, layers, buildings, filters, metadata)
- `src/services/` - API client (session cookie) and endpoint modules
- `src/components/Map/` - Map component and composables for layers, sources, events, clustering
- `src/config/layers/` - MapLibre layer style definitions
- `src/datastructures/` - TypeScript interfaces, enums, and data classes
- `src/views/` - Page components (auth, map, home)
- `src/styles/` - Custom CSS using native nesting

### Path Aliases

- `@` maps to `./src`
- `@assets` maps to `./src/assets`
