import { watch } from "vue"
import { storeToRefs } from 'pinia';

import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

import { useBuildingStore } from "@/store/buildings";


export const useBuildingRouting = function useBuildingRouting() {

  const router = useRouter()
  const route = useRoute()

  const buildingStore = useBuildingStore()
  const { setBuildingId, clearBuildingId } = buildingStore
  const { buildingId } = storeToRefs(buildingStore)

  /**
   * Navigate to a building, taking the current route context into account
   */
  function navigateToBuilding(id: string|null) {

    // If ID is null, we want to navigate away from any and all buildings
    // If mapset is unknown, we cannot navigate to a building - even if we have a buildingId
    if (! id || ! route.params.mapsetId) {

      // If no mapset id is known, go home
      if (! route.params.mapsetId) {
        router.push({ name: 'home' }) 

      // Otherwise load the mapset
      } else if (route.name !== 'mapset') {
        router.push({ 
          name: 'mapset', 
          params: { mapsetId: route.params.mapsetId },
          query: route.query
        })
      }

    // We have a building id & a mapset id. We can open a building page or even a specific panel
    } else {
      let name = route.name

      let params = {
        mapsetId: route.params.mapsetId,
        buildingId: id
      }

      if (name && ['building', 'building-panel'].includes(name as string)) {
        // name = name
        params = Object.assign(params, {
          panel: route.params.panel || null
        })
      } else {
        name = 'building'
      }
      
      router.push({ name, params, query: route.query })
    }
  }

  /**
   * Start watching the buildingId
   *  Update the store if it changes. That will do the rest
   */
  function start() {
    watch(
      () => route.params.buildingId,
      (value) => {
        if (value) {
          setBuildingId(value as string)
        } else {
          clearBuildingId()
        }
      },
      { immediate: true }
    )

    // Navigate away from the building / building-panel page
    watch(
      () => buildingId.value,
      (id) => {
        if (! id && ['building', 'building-panel'].includes(route.name as string)) {
          router.push({ name: 'mapset', params: route.params, query: route.query })
        }
      }
    )

  }

  return {
    start,
    navigateToBuilding
  }
}