<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'; // onBeforeMount, 
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'

// Layout
import Header from '@/components/Layout/Header.vue'
import Map from '@/components/Mapbox/Map.vue'
import LeftSidebar from '@/components/Layout/LeftSideBar.vue'
import RightSidebar from '@/components/Layout/RightSideBar.vue'

// Modals
import ProfileModal from '@/components/Modals/ProfileModal.vue'
import PasswordModal from '@/components/Modals/PasswordModal.vue'
import NoGroupsModal from '@/components/Modals/NoMapsetsModal.vue';
import InquirySampleModal from '@/components/Modals/InquirySampleModal.vue';
import RecoverySampleModal from '@/components/Modals/RecoverySampleModal.vue';
// Popover modals
import InfoPopoverModal from '@/components/Modals/InfoPopoverModal.vue';
import RemarkPopoverModal from '@/components/Modals/RemarkPopoverModal.vue';

// Other
import LoadingIndicator from '@/components/Branding/LoadingIndicator.vue'
import Button from '@/components/Common/Buttons/Button.vue';

// Icons
import FilterIcon from '@assets/svg/icons/filter.svg'

import { useMapsetStore } from '@/store/mapsets'
import { useMainStore } from '@/store/main'
import { useLayersStore } from '@/store/layers';
import { useBuildingStore } from "@/store/buildings";

import { useMapsetRouting } from '@/router/mapsetRouting'
import { useBuildingRouting } from '@/router/buildingRouting'
import StatisticsModal from '@/components/Modals/StatisticsModal.vue';
import DisclaimerModal from '@/components/Modals/DisclaimerModal.vue';


const router = useRouter()

const { 
  removeAllMapsets
} = useMapsetStore()

const {
  retrieveLayerVisibilityFromSessionStorage
} = useLayersStore()

const { 
  isLoadingMapsetsDebounced, 
  hasAvailableMapsets, 
  noMapsetsFound, 
} = storeToRefs( useMapsetStore() )
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
  return isLoadingMapsetsDebounced.value === false 
    && (hasAvailableMapsets.value === true || noMapsetsFound.value === true) 
    && mapboxIsReady.value
})

/**
 * Enable the logic that loads and selects mapsets based on the route
 */
useMapsetRouting()

/**
 * Enable the logic that loads and selects buildings based on the route
 */
useBuildingRouting().start()


/**
 * If all the mapsets are unloaded, redirect to the login page
 */
watch(() => hasAvailableMapsets.value, (value, oldValue) => {
  console.log("Main - Redirect to login page?", value)

  if (value === false && oldValue === true) {
    console.log("Main - Yes")

    router.push({ name: 'login' })
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
      <InfoPopoverModal />
    </Transition>

    <Transition>
      <RemarkPopoverModal />
    </Transition>

    <Transition>
      <InquirySampleModal />
    </Transition>

    <Transition>
      <RecoverySampleModal />
    </Transition>

    <Transition>
      <StatisticsModal />
    </Transition>

    <Transition>
      <DisclaimerModal />
    </Transition>

    <Transition>
      <ProfileModal />
    </Transition>

    <Transition>
      <PasswordModal />
    </Transition>

  </div>
</template>