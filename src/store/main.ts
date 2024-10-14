
import { type Ref, ref } from 'vue';
import { defineStore} from 'pinia'

/**
 * Whether the profile modal is shown
 */
const isProfileModalOpen: Ref<boolean> = ref(false)

/**
 * Whether the password modal is shown
 */
const isPasswordModalOpen: Ref<boolean> = ref(false)

/**
 * Whether the left sidebar is open
 */
const isLeftSidebarOpen: Ref<boolean> = ref(false)

/**
 * Whether the info popover is shown
 */
const isInfoPopoverOpen: Ref<boolean> = ref(false)

/**
 * Whether the remarks popover is shown
 */
const isRemarkPopoverOpen: Ref<boolean> = ref(false)
const remarkPopoverTitle: Ref<string> = ref('')
const remarkPopoverText: Ref<string> = ref('')

/**
 * Whether to show the list of available mapsets
 *  defaults to false to first show the legend of the active mapset
 */
const isShowingMapsetSelection: Ref<boolean> = ref(false)

/**
 * The map center is used to make the geocoder results more accurate
 *  When the value is changed, the map will fly to the specified center
 */
const mapCenterLatLon: Ref<mapboxgl.LngLat|null> = ref(null)

/**
 * These coordinates are used to drop a marker, unless a building has been selected.
 */
const mapMarkerLatLon: Ref<mapboxgl.LngLat|null> = ref(null)


function useMain() {
  return {
    isProfileModalOpen,
    isPasswordModalOpen,

    // Left sidebar
    isLeftSidebarOpen,
    isShowingMapsetSelection,
    isInfoPopoverOpen,
    
    // Remarks Popover
    isRemarkPopoverOpen,
    remarkPopoverTitle,
    remarkPopoverText,

    // LatLng of Mapbox map
    mapCenterLatLon,

    // LatLng of Mapbox marker
    mapMarkerLatLon
  }
}

export const useMainStore = defineStore(
  'Main',
  useMain
)