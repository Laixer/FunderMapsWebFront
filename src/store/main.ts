
import { type Ref, ref } from 'vue';
import { defineStore} from 'pinia'


const isProfileModalOpen: Ref<boolean> = ref(false)
const isLeftSidebarOpen: Ref<boolean> = ref(false)

/**
 * The map center is used to make the geocoder results more accurate
 *  When the value is changed, the map will fly to the specified center
 */
const mapCenterLatLon: Ref<mapboxgl.LngLat|null> = ref(null)

function useMain() {
  return {
    isProfileModalOpen,
    isLeftSidebarOpen,

    mapCenterLatLon
  }
}

export const useMainStore = defineStore(
  'Main',
  useMain
)