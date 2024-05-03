/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Mapbox
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_MAPBOX_STYLE: string

  // PDOK
  readonly VITE_PDOK_LOCATIONSERVICE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}