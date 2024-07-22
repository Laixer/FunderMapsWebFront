
import { type Ref, ref } from 'vue';
import { defineStore} from 'pinia'
import { useSessionStore } from './session';

/**
 * Whether the profile modal is shown
 */
const isProfileModalOpen: Ref<boolean> = ref(false)


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

function useMain() {

  const SessionStore = useSessionStore()

  /**
   * Whether the left sidebar is open
   *  Initial state depends on whether a user is logged in. 
   */
  const isLeftSidebarOpen: Ref<boolean> = ref(! SessionStore.isAuthenticated)



  return {
    isProfileModalOpen,

    // Left sidebar
    isLeftSidebarOpen,
    isShowingMapsetSelection,
    isInfoPopoverOpen,
    
    // Remarks Popover
    isRemarkPopoverOpen,
    remarkPopoverTitle,
    remarkPopoverText,

    // LatLng of Mapbox map
    mapCenterLatLon
  }
}

export const useMainStore = defineStore(
  'Main',
  useMain
)