import { toRaw, watch } from "vue"
import { storeToRefs } from 'pinia';
import { type Map } from "mapbox-gl"

import { type IMapsetFE } from "@/datastructures/interfaces";

import { useMapsetStore } from '@/store/mapsets';
import { useLayersStore } from "@/store/layers";
import { useBuildingStore } from "@/store/buildings";


/**
 * Reference to the Mapbox instance
 */
let mapInstance: Map|null = null

/**
 * Reference to the mapset watcher, used to clean up the watcher
 */
let UnWatchActiveMapsetChanges: Function|null = null
let UnWatchLayerVisibilityChanges: Function|null = null

/**
 * Layer id of currently shown layer
 */
let currentlyVisibleLayers: string[] = []
let currentlyHiddenLayers: string[] = []

/***********************************************************************************
 * Public functions
 **********************************************************************************/

/**
 * Start watching for map style changes
 */
export const startWatchingForMapsetChanges = function startWatchingForMapsetChanges(map: Map) {

  // Clean up first, before we start watching again
  stopWatchingMapsetChanges()

  // Stores
  const { activeMapset } = storeToRefs( useMapsetStore() )
  const { visibleLayersByMapsetId } = storeToRefs(useLayersStore())
  const { getVisibleLayersByMapsetId } = useLayersStore()

  // store a local ref to the map
  mapInstance = map

  // Watch style changes
  mapInstance.on('style.load', handleStyleChange)

  // Whenever the mapset changes, change the active map style
  UnWatchActiveMapsetChanges = watch(
    () => activeMapset.value, 
    (mapset, oldMapset) => {

      // Detach current event handlers before changing styles
      if (mapInstance !== null && oldMapset) {
        removeEventHandlers(oldMapset)
      }

      if (mapInstance !== null && mapset?.style) {
        mapInstance.setStyle(mapset.style)
      }
    }
  )

  // Whenever the visibility of a layer changes, we check whether it impacts the shown map
  // TODO: Find a suitable way to move this logic to the store ... 
  UnWatchLayerVisibilityChanges = watch(
    () => visibleLayersByMapsetId.value, 
    () => {

      if (! activeMapset.value) return 

      // Get the visible layers
      const visibleLayers = toRaw(getVisibleLayersByMapsetId(activeMapset.value.id))

      // has anything changed? 
      const newlyHidden = currentlyVisibleLayers.filter(layerId => ! visibleLayers.includes(layerId))
      const newlyVisible = visibleLayers.filter(layerId => ! currentlyVisibleLayers.includes(layerId))

      // Only bother mapbox with the actual changes
      if (newlyVisible.length !== 0) {
        newlyVisible.forEach(layerId => {
          mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'visible');
        })
      }

      // Only bother mapbox with the actual changes
      if (newlyHidden.length !== 0) {
        newlyHidden.forEach(layerId => {
          mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'none');
        })
      }

      // Update the local lists
      currentlyVisibleLayers = visibleLayers
      currentlyHiddenLayers = currentlyHiddenLayers
        .filter(layerId => ! currentlyVisibleLayers.includes(layerId))
        .concat(newlyHidden)

    },
    { deep: true }
  )

  // Apply to the initial style being presented
  handleStyleChange()
}

/**
 * Responsible cleanup of the watcher
 */
export const stopWatchingMapsetChanges = function stopWatchingMapsetChanges() {

  mapInstance?.off('style.load', handleStyleChange)
  mapInstance = null

  if (UnWatchActiveMapsetChanges !== null) {
    UnWatchActiveMapsetChanges()
  }
  if (UnWatchLayerVisibilityChanges !== null) {
    UnWatchLayerVisibilityChanges()
  }
}


/***********************************************************************************
 * Private functions
 **********************************************************************************/


/**
 * Handle a switch between mapsets when Mapbox is ready for it
 */
const handleStyleChange = function handleStyleChange() {
  const { activeMapset } = storeToRefs( useMapsetStore() )

  if (! activeMapset.value) return // Make TS happy

  applyMunicipalityFilterToLayers(activeMapset.value)
  revealVisibleLayers(activeMapset.value)

  attachEventHandlers(activeMapset.value)
}

/**
 * Apply the municipality filter to the layer presentation
 */
const applyMunicipalityFilterToLayers = function applyMunicipalityFilterToLayers(mapset: IMapsetFE) {
  if (mapInstance === null) return // Make TS happy
  if (mapset.fenceMunicipality === null) return // No filter necessary

  // TODO: Re-enable 
  // for (const layer of mapset.layerSet) {
  //   mapInstance.setFilter(layer.id, [
  //     'all',
  //     mapInstance.getFilter(layer.id),
  //     [
  //       "match",
  //       ["get", "municipality_id"],
  //       [
  //         mapset.fenceMunicipality
  //       ],
  //       true,
  //       false
  //     ]
  //   ])  
  // }
}

/**
 * Reveal layers that were previously enabled (by referencing sessionStorage)
 *  If none were enabled, enable the first layer of the layerSet
 */
const revealVisibleLayers = function revealVisibleLayers(mapset: IMapsetFE) {

  const { getVisibleLayersByMapsetId, changeLayerVisibility } = useLayersStore()

  if (mapInstance === null) return // Make TS happy

  // Reset the local trackers
  // TODO: The store benefit is starting to become dubious. At least how it is currently designed...
  currentlyVisibleLayers = []
  currentlyHiddenLayers = []

  // Use the known layer ids as whitelist
  const knownLayerIds = mapset.layerSet.map(layer => layer.id)

  const visibleLayers = getVisibleLayersByMapsetId(mapset.id)
    .filter(layerId => knownLayerIds.includes(layerId))
  
  // Reveal the visible, known layers
  if (visibleLayers.length !== 0) {
    visibleLayers.forEach(function (layerId) {
      mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'visible')
    })

    // Update the local lists
    currentlyVisibleLayers = visibleLayers
    currentlyHiddenLayers = knownLayerIds.filter(layerId => ! visibleLayers.includes(layerId))

    // Not all layers are hidden by default
    currentlyHiddenLayers.forEach(layerId => {
      mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'none')
    })
  } 
  // of if there are none, reveal the first known layer
  else {

    // activate the first layer through the store
    currentlyVisibleLayers = []
    currentlyHiddenLayers = knownLayerIds

    // Not all layers are hidden by default
    currentlyHiddenLayers.forEach(layerId => {
      mapInstance && mapInstance.setLayoutProperty(layerId, 'visibility', 'none')
    })

    changeLayerVisibility(knownLayerIds[0], true, mapset.id)
  }
}



/***********************************************************************************
 * Event handlers
 *  TODO: Move to separate ts file
 **********************************************************************************/


const mouseEnter = function mouseEnter() {
  mapInstance && (mapInstance.getCanvas().style.cursor = "pointer")
}
const mouseLeave = function mouseLeave() {
  mapInstance && (mapInstance.getCanvas().style.cursor = "")
}


const handleBuildingClick = async function handleBuildingClick(e: any) {
  if (e.features.length === 0) return 

  console.log("click", e.features[0], e.features[0].properties)

  const building_id = e.features[0].properties?.building_id || e.features[0].properties?.id || null
  if (! building_id) return

  // Select the building
  // TODO: trigger the router instead of setting id in store? 
  const { setBuildingId } = useBuildingStore()
  setBuildingId( building_id )

  // setBuildingId( "NL.IMBAG.PAND.0599100000281056" )

  // Incidents
  // setBuildingId( "NL.IMBAG.PAND.0301100000001995" )
  // setBuildingId( "NL.IMBAG.PAND.0214100000005013" )

  // Multiple incidents
  // setBuildingId( "NL.IMBAG.PAND.0363100012186092" )

  // 4 inquiry Samples + report
  // setBuildingId( "NL.IMBAG.PAND.0599100000643396" )
  // setBuildingId( "gfm-b104b66d77fa402e9872067e75d72267" )

  // revocery samples + report
  // setBuildingId( "NL.IMBAG.PAND.0599100000659142" )

  // Recovery
  // setBuildingId( "NL.IMBAG.PAND.0599100000610651" )

  // Inquiry
  // setBuildingId( "NL.IMBAG.PAND.1700100000005240" ) 
  

  // Incidents at Langesteeg 23, 4011JS Zoelen
  // setBuildingId( "NL.IMBAG.PAND.0214100000005013" )

  // Langesteeg 23, 4011JS Zoelen from PDOK lookup
  // setBuildingId( "NL.IMBAG.NUMMERAANDUIDING.0214010000002413" )
  // setBuildingId( 'adr-eba7860833be5375c03770304a68edb4' )
  // setBuildingId( '0214010000002413' )
}

const removeEventHandlers = function removeEventHandlers(mapset: IMapsetFE) {
  if (! mapset) return 

  mapset.layerSet
    .map(layer => layer.id)
    .forEach(layerId => {
      if (! mapInstance) return
      
      mapInstance.off("mouseenter", layerId, mouseEnter)
      mapInstance.off("mouseleave", layerId, mouseLeave)
      mapInstance.off("click", layerId, handleBuildingClick)
    })
}


const attachEventHandlers = function attachEventHandlers(mapset: IMapsetFE) {
  mapset.layerSet
    .map(layer => layer.id)
    .forEach(layerId => {
      if (! mapInstance) return
      
      mapInstance.on("mouseenter", layerId, mouseEnter)
      mapInstance.on("mouseleave", layerId, mouseLeave)
      mapInstance.on("click", layerId, handleBuildingClick)
    }) 
}

