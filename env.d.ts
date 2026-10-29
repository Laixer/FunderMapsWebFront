/// <reference types="vite/client" />

interface ImportMetaEnv {

  // PDOK
  readonly VITE_PDOK_LOCATIONSERVICE: string

  // Fundermaps Base API Url
  readonly VITE_FUNDERMAPS_URL: string
  
  // Default Mapset
  readonly VITE_DEFAULT_MAPSET_ID: string
  readonly VITE_DEFAULT_LAYERS: string

  // Fundermaps dynamic tileserver (Martin) — serves the 'buildings' source
  readonly VITE_FUNDERMAPS_TILESERVER_URL: string

  // Fundermaps base map style
  readonly VITE_FUNDERMAPS_BASE_STYLE: string

  // Layer the building-number labels are inserted before (optional)
  readonly VITE_FUNDERMAPS_NUMBER_LAYER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}