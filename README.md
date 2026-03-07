# FunderMaps

Web frontend for the FunderMaps platform — a building foundation and subsidence analysis tool with interactive map visualization.

Built with Vue 3, TypeScript, Vite, and Mapbox GL.

## Prerequisites

- Node.js ^22.0.0
- pnpm

## Setup

```sh
pnpm install
```

Create a `.env` file with the following variables:

```
VITE_MAPBOX_TOKEN=<Mapbox API token>
VITE_MAPBOX_STYLE=<Mapbox style URL>
VITE_FUNDERMAPS_URL=<API base URL>
VITE_FUNDERMAPS_TILES_URL=<Tile server URL>
VITE_DEFAULT_MAPSET_ID=<Default mapset UUID>
VITE_DEFAULT_LAYERS=<Comma-separated default visible layer names>
```

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

The application uses `<script setup>` single-file components, Pinia for state management, and Tailwind CSS v4 for styling. Authentication is JWT-based. Map layers and data sources are configured per mapset with geographic fencing.

### Source Layout

- `src/router/` - Vue Router configuration
- `src/store/` - Pinia stores (session, mapsets, layers, buildings, filters, metadata)
- `src/services/` - API client with JWT auth and endpoint modules
- `src/components/Mapbox/` - Map component and composables for layers, sources, events, clustering
- `src/config/layers/` - Mapbox GL layer style definitions
- `src/datastructures/` - TypeScript interfaces, enums, and data classes
- `src/views/` - Page components (auth, map, home)
- `src/styles/` - Custom CSS using native nesting

### Path Aliases

- `@` maps to `./src`
- `@assets` maps to `./src/assets`
