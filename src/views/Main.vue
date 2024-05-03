<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'; // onBeforeMount, 
import { storeToRefs } from 'pinia';

import Header from '@/components/Layout/Header.vue'
import LeftSidebar from '@/components/Layout/LeftSideBar.vue'
import RightSidebar from '@/components/Layout/RightSideBar.vue'
import Button from '@/components/Common/Buttons/Button.vue';
import LoadingIndicator from '@/components/Branding/LoadingIndicator.vue'
import ProfileModal from '@/components/Modals/ProfileModal.vue'
import NoGroupsModal from '@/components/Modals/NoMapsetsModal.vue';
import FilterIcon from '@assets/svg/icons/filter.svg'

import Map from '@/components/Mapbox/Map.vue'

import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useMapsetStore } from '@/store/mapsets'
import { useMainStore } from '@/store/main'
import { useSessionStore } from '@/store/session';
import { useLayersStore } from '@/store/layers';
import { useBuildingStore } from "@/store/buildings";
import InquirySampleModal from '@/components/Modals/InquirySampleModal.vue';
import RecoverySampleModal from '@/components/Modals/RecoverySampleModal.vue';

const router = useRouter()
const route = useRoute()

const { 
  loadAvailableMapsets, 
  loadAvailableMapsetsById, 
  isMapsetAvailable,
  isPublicMapset,
  selectMapsetById,
  removeAllMapsets
} = useMapsetStore()

const {
  retrieveLayerVisibilityFromSessionStorage
} = useLayersStore()

const { 
  isLoadingMapsetsDebounced, 
  hasAvailableMapsets, 
  hasAvailablePrivateMapsets,
  noMapsetsFound, 
  firstMapsetId, 
  activeMapsetId 
} = storeToRefs( useMapsetStore() )
const { isAuthenticated } = storeToRefs( useSessionStore() )
const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { hasSelectedBuilding } = storeToRefs( useBuildingStore() )

/**
 * Whether mapbox has initiated
 */
const mapboxIsReady = ref(false)

/**
 * Loaded when not currently loading and mapsets are available or no mapsets were found
 */
const loaded = computed(() => {
  // console.log("Main - loaded computed", isLoadingMapsetsDebounced.value, hasAvailableMapsets.value, noMapsetsFound.value, mapboxIsReady.value)
  // console.log("Main - loaded conclusion", isLoadingMapsetsDebounced.value === false && (hasAvailableMapsets.value === true || noMapsetsFound.value === true) && mapboxIsReady.value)
  return isLoadingMapsetsDebounced.value === false 
    && (hasAvailableMapsets.value === true || noMapsetsFound.value === true) 
    && mapboxIsReady.value
})

/**
 * Handle changes in the mapsetId in the path
 *  Load the mapset(s) if necessary
 */
watch(() => route.params.mapsetId, async () => {
  /**
   * The sessionStorage key used to store the id of the last viewed public mapset
   */
  const publicMapsetSessionKey = 'last-viewed-public-mapset'
  // const privateMapsetSessionKey = 'last-viewd-private-mapset'

  /**
   * When opening the application without a specific mapset in mind, 
   *  check for the last viewed public mapset in the session storage
   *  TODO: check for the last viewed private mapset as 3rd option.
   */
  const mapsetId = route.params?.mapsetId 
    || sessionStorage.getItem(publicMapsetSessionKey)

  console.log("Main - MapsetId param changed", mapsetId)

  /**
   * A specific (public) mapset is requested
   */ 
  if (mapsetId) {

    // Avoid loading a mapset twice
    if (! isMapsetAvailable(mapsetId as string)) {
      console.log("Main - is not available")

      // Note: This also loads all other available mapsets for a logged in user.
      // TODO: This generates a failed API call for logged in users that have not yet loaded any mapsets
      // TODO:  This failed call is handled further on, but perhaps it could be avoided, without 
      // TODO:  negating the option to load public mapsets for logged in users by opening an url
      await loadAvailableMapsetsById(mapsetId as string)
    }

    // If the mapset is (now) available and public, store the id as last viewed public mapset
    if (isPublicMapset(mapsetId as string)) {
      sessionStorage.setItem(publicMapsetSessionKey, mapsetId.toString())
    }

    // All went well, time to show the requested mapset
    if (isMapsetAvailable(mapsetId as string)) {
      console.log("Main - is available")
      selectMapsetById(mapsetId as string)
      return
    }
  }

  /**
   * Not logged in and not requesting a specific public mapset,
   *  or is the requested mapset not public?
   * => redirect to login
   */
  if (! isAuthenticated.value) {
    console.log("Main - user not logged in")
    router.push({ name: 'login' })
    return
  }

  /**
   * Beyond this point we're dealing with a logged in user
   */

  // Load the available mapsets, if this has not been done yet
  if (! hasAvailablePrivateMapsets.value) {
    console.log("Main - no mapsets available yet")
    await loadAvailableMapsets()
  }

  // Aparently the user has no access to any mapsets
  // A modal will be shown to the user if this is the case
  if (! hasAvailableMapsets.value) {
    console.log("Main - Failed to load any mapsets")
    return
  }

  // The requested mapset was one of the private mapsets available to the user
  // Note: private mapsets cannot be requested through the endpoint to retrieve public + available private mapsets
  if (mapsetId && isMapsetAvailable(mapsetId as string)) {
    console.log("Main - requested mapset is now available")
    selectMapsetById(mapsetId as string)
    return 
  }

  console.log("Main - redirecting to first available mapset")
  // TODO: Maybe skip loading loadAvailableMapsetsById first for authenticated users and fall back to it here? 
  
  // If no mapset was requested, or the mapset was not available,
  //  redirect the user to the first mapset from the list of available mapsets
  router.push({ 
    name: 'mapset', 
    params: { mapsetId: firstMapsetId.value as string }
  })
}, { immediate: true })


/**
 * If the activeMapsetId changed from another source than the route param, make the route match
 *  This triggers the associated logic of loading mapset data if necessary
 * 
 *  TODO: Include building route param
 */
watch(() => activeMapsetId.value, (value) => {
  console.log("Main - Redirect to different mapset?", value)

  if (value && value !== route.params?.mapsetId) {
    console.log("Main - Yes")
    router.push({ 
      name: 'mapset', 
      params: { mapsetId: value }
    })
  } else {
    console.log("Main - No")
  }
})

/**
 * If all the mapsets are unloaded, redirect to the login page
 */
watch(() => hasAvailableMapsets.value, (value, oldValue) => {
  console.log("Main - Redirect to login page?", value)

  if (value === false && oldValue === true) {
    console.log("Main - Yes")

    router.push({
      name: 'login'
    })
  } else {
    console.log("Main - No")
  }
})

/**
 * The layer visibility impacts both the legend and the map
 */
onBeforeMount(() => {
  retrieveLayerVisibilityFromSessionStorage()
})

/**
 * A little cleanup
 */
onBeforeUnmount(() => {
  removeAllMapsets()
})

const handleOpenLeftSidebar = function handleOpenLeftSidebar() {
  isLeftSidebarOpen.value = true
}

const handleMapboxIsReady = function handleMapboxIsReady() {
  mapboxIsReady.value = true
}

</script>

<template>
  <div class="page-dashboard">
    <Header />
    
    <!-- Map view -->
    <div
      class="app-view | map-placeholder-bg relative bg-grey-200"
    >
      <Map @ready="handleMapboxIsReady" />

      <Transition name="short">
        <div
          v-show="hasAvailableMapsets && ! isLeftSidebarOpen"
          class="map__actions | absolute left-8 top-12"
        >
          <Button @click.prevent="handleOpenLeftSidebar" label="Open filter">
            <template v-slot:before>
              <FilterIcon class="w-3" aria-hidden="true" />
            </template>
          </Button>
        </div>
      </Transition>
    </div>

    <!-- Loading overlay -->
    <Transition>
      <div 
        v-if="! loaded"
        class="app-view | relative grid place-items-center bg-grey-200"
        aria-busy="true">
        <LoadingIndicator />
      </div>
    </Transition>
    

    <!-- Sidebars -->
    <Transition>
      <LeftSidebar v-show="isLeftSidebarOpen" />
    </Transition>

    <Transition>
      <RightSidebar v-show="hasSelectedBuilding" />
    </Transition>
    
    <!-- Modals - keep in mind the order of these -->
    <Transition>
      <NoGroupsModal />
    </Transition>

    <Transition>
      <InquirySampleModal />
    </Transition>

    <Transition>
      <RecoverySampleModal />
    </Transition>

    <Transition>
      <ProfileModal />
    </Transition>

  </div>
</template>