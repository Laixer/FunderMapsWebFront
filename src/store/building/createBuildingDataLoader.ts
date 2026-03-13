import { type Ref, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { APIErrorResponse } from '@/services/apiClient'
import { useSessionStore } from '../session'

/**
 * Creates the common loading/caching/error-tracking pattern shared by building data stores.
 * Must be called inside a Pinia defineStore setup function.
 */
export function createBuildingDataLoader<T>(
  name: string,
  apiFn: (buildingId: string) => Promise<T>,
  transform?: (response: T) => T | null
) {
  const dataByBuildingId = ref({}) as Ref<Record<string, T | null>>
  const isLoadingById: Ref<Record<string, boolean>> = ref({})
  const failedToLoadById: Ref<Record<string, { reason: number }>> = ref({})

  function hasBeenRetrieved(buildingId: string): boolean {
    return buildingId in dataByBuildingId.value
  }

  function failedToLoad(buildingId: string): boolean {
    return buildingId in failedToLoadById.value
  }

  function hasData(buildingId: string): boolean {
    return hasBeenRetrieved(buildingId) && !!dataByBuildingId.value[buildingId]
  }

  function getData(buildingId: string): T | null {
    if (!hasData(buildingId)) return null
    return dataByBuildingId.value[buildingId]
  }

  async function loadData(buildingId: string, cache = true) {
    try {
      if (isLoadingById.value[buildingId]) return
      isLoadingById.value[buildingId] = true

      if (cache && hasBeenRetrieved(buildingId)) return

      const response = await apiFn(buildingId)
      dataByBuildingId.value[buildingId] = transform
        ? transform(response)
        : (response || null)
    } catch (e) {
      console.error(`Failed to load ${name} data`, buildingId, e)
      failedToLoadById.value[buildingId] = { reason: e instanceof APIErrorResponse ? e.status : 500 }
    }

    isLoadingById.value[buildingId] = false
  }

  function clear() {
    dataByBuildingId.value = {}
    isLoadingById.value = {}
    failedToLoadById.value = {}
  }

  // Clean up on logout
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(isAuthenticated, (value) => {
    if (value !== true) clear()
  })

  return {
    dataByBuildingId,
    hasBeenRetrieved,
    failedToLoad,
    hasData,
    getData,
    loadData,
    clear,
  }
}
