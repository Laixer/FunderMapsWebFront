<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router'

// Layout
import Header from '@/components/Layout/Header.vue'
import Map from '@/components/Map/Map.vue'
import LeftSidebar from '@/components/Layout/LeftSideBar.vue'
import RightSidebar from '@/components/Layout/RightSideBar.vue'

// Modals
import ProfileModal from '@/components/Modals/ProfileModal.vue'
import PasswordModal from '@/components/Modals/PasswordModal.vue'
import NoGroupsModal from '@/components/Modals/NoMapsetsModal.vue';
import InquirySampleModal from '@/components/Modals/InquirySampleModal.vue';
import RecoverySampleModal from '@/components/Modals/RecoverySampleModal.vue';
// Popover modals
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
import { usePhoneLayout } from '@/components/Layout/usePhoneLayout'
import StatisticsModal from '@/components/Modals/StatisticsModal.vue';
import DisclaimerModal from '@/components/Modals/DisclaimerModal.vue';


const router = useRouter()

const {
  removeAllMapsets
} = useMapsetStore()

const {
  retrieveLayerVisibility
} = useLayersStore()

const {
  isLoadingMapsetsDebounced,
  hasAvailableMapsets,
  noMapsetsFound,
  activeMapset,
} = storeToRefs(useMapsetStore())
const { isLeftSidebarOpen } = storeToRefs(useMainStore())
const { hasSelectedBuilding, buildingId } = storeToRefs(useBuildingStore())

/**
 * Whether the map has initiated
 */
const mapIsReady = ref(false)

/**
 * Loaded when not currently loading and mapsets are available or no mapsets were found
 */
const loaded = computed(() => {
  return isLoadingMapsetsDebounced.value === false
    && (hasAvailableMapsets.value === true || noMapsetsFound.value === true)
    && mapIsReady.value
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
 * The tab title: the pand when one is open, otherwise the mapset.
 *
 * Owned here and not by the router: the router's afterEach also runs every
 * time the map moves (the position is kept in the query string), and used to
 * put the bare "FunderMaps" back over the mapset name, or the mapset name over
 * the pand, depending on which finished last.
 */
watch([() => activeMapset.value, () => buildingId.value], ([mapset, pand]) => {
  if (pand) {
    document.title = `Pand ${pand} — FunderMaps`
  } else if (mapset) {
    document.title = `${mapset.name} — FunderMaps`
  }
}, { immediate: true })

/**
 * If all the mapsets are unloaded, redirect to the login page
 */
watch(() => hasAvailableMapsets.value, (value, oldValue) => {

  if (value === false && oldValue === true) {
    router.push({ name: 'login', query: { redirect: window.location.pathname + window.location.search } })
  }
})


/**
 * The layer visibility impacts both the legend and the map
 */
onBeforeMount(() => {
  retrieveLayerVisibility()
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

/**
 * On a phone an open side bar covers the map, and two would cover each other.
 *  A pand that opens (from the search field, which stays in reach) takes the
 *  place of the mapset side bar, so that closing the pand leads to the map.
 */
const isPhone = usePhoneLayout()

watch([() => hasSelectedBuilding.value, isPhone], ([hasPand, phone]) => {
  if (hasPand && phone) {
    isLeftSidebarOpen.value = false
  }
})

const handleMapIsReady = function handleMapIsReady() {
  mapIsReady.value = true
}

</script>

<template>
  <div class="page-dashboard">
    <Header />

    <!-- Map view -->
    <div class="app-view | map-placeholder-bg relative bg-grey-200">
      <Map @ready="handleMapIsReady" />

      <Transition name="short">
        <div v-show="hasAvailableMapsets && !isLeftSidebarOpen" class="map__actions | absolute left-8 top-12 max-md:left-4 max-md:top-4">
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
      <div v-if="!loaded" class="app-view | relative grid place-items-center bg-grey-200" aria-busy="true">
        <LoadingIndicator />
      </div>
    </Transition>


    <!-- Sidebars -->
    <Transition name="slide-left">
      <LeftSidebar v-if="isLeftSidebarOpen" />
    </Transition>

    <Transition name="slide-right">
      <RightSidebar v-show="hasSelectedBuilding" />
    </Transition>

    <!-- Modals - keep in mind the order of these -->
    <Transition>
      <NoGroupsModal />
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