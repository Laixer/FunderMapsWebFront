<script setup lang="ts">

import { computed, onMounted, ref, watch, type Component } from 'vue';
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BuildingIdHeader from '@/components/BuildingIdHeader.vue';
import MenuLink from '@/components/Common/Links/MenuLink.vue';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';
import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';
import SkeletonLoader from '@/components/Common/SkeletonLoader.vue';

import BuildingPanel from '@/components/Building/BuildingPanel.vue';
import FoundationPanel from '@/components/Building/FoundationPanel.vue';
import FoundationRiskPanel from '@/components/Building/FoundationRiskPanel.vue';
import IncidentsPanel from '@/components/Building/IncidentsPanel.vue';
import InquiryPanel from '@/components/Building/InquiryPanel.vue';
import LocationPanel from '@/components/Building/LocationPanel.vue';
import RecoveryPanel from '@/components/Building/RecoveryPanel.vue';
import StatisticsPanel from '@/components/Building/StatisticsPanel.vue';

import RightSideBarFooterLinks from '@/components/RightSideBarFooterLinks.vue';
import AlertIcon from '@assets/svg/icons/alert.svg';
import MapsetDetails from '../Building/MapsetDetails.vue';

import { useSessionStore } from '@/store/session';
import { useBuildingStore } from "@/store/buildings";
import { useBuildingData } from './useBuildingData';

import { useRoute, useRouter } from 'vue-router';


const route = useRoute()
const router = useRouter()

const { isAuthenticated } = storeToRefs(useSessionStore())
const { clearBuildingId } = useBuildingStore()
const { hasSelectedBuilding, buildingId } = storeToRefs(useBuildingStore())

const {
  failedToLoad,
  isLoadingCoreData,
  statisticsStore,
  buildingRecoveryReportDataHasBeenRetrieved,
  buildingHasRecoveryReports,
  buildingInquiryDataHasBeenRetrieved,
  buildingHasInquiries,
  buildingIncidentReportDataHasBeenRetrieved,
  buildingHasIncidentReports,
  startWatching,
} = useBuildingData()


/**
 * UI state
 */
const isOpen = ref(false)
const rightPanelSlide = ref(false)
const selectedPanel = ref('')

interface IComponents {
    [key: string]: Component
}
const availablePanels: IComponents = {
  BuildingPanel,
  FoundationPanel,
  FoundationRiskPanel,
  IncidentsPanel,
  InquiryPanel,
  LocationPanel,
  RecoveryPanel,
  StatisticsPanel
}

/**
 * Start loading building data when a building is selected
 */
startWatching(() => {
  isOpen.value = true
})

/**
 * These menu items are always available
 */
const BuildingMenuList = computed(
  () => {
    return [
      {
        slug: 'pand',
        panel: 'BuildingPanel',
        icon: 'building',
        name: 'Pand',
        loading: false,
        disabled: false,
        route: null
      },
      {
        slug: 'locatie',
        panel: 'LocationPanel',
        icon: 'pin',
        name: 'Locatie',
        loading: false,
        disabled: false,
        route: null
      },
      {
        slug: 'fundering',
        panel: 'FoundationPanel',
        icon: 'file-foundation',
        name: 'Fundering',
        loading: false,
        disabled: false,
        route: null
      },
      {
        slug: 'statistiek',
        panel: 'StatisticsPanel',
        icon: 'graph',
        name: 'Statistiek',
        loading: false,
        disabled: !! (buildingId.value && statisticsStore.failedToLoad(buildingId.value)),
        route: null
      },
      {
        slug: 'funderingsrisico',
        panel: 'FoundationRiskPanel',
        icon: 'alert',
        name: 'Funderingsrisico',
        loading: false,
        disabled: false,
        route: null
      },
    ]
  }
)
/**
 * These menu items are only available if there is data available
 */
const ReportMenuList = computed(
  () => {
    return [
      {
        slug: 'onderzoek',
        panel: 'InquiryPanel',
        icon: null,
        name: 'Bekijk onderzoeks informatie',
        loading: !! (buildingId.value && ! buildingInquiryDataHasBeenRetrieved(
          buildingId.value
        )),
        disabled: !! (buildingId.value && ! buildingHasInquiries(
          buildingId.value
        )),
        route: null
      },
      {
        slug: 'herstel',
        panel: 'RecoveryPanel',
        icon: null,
        name: 'Bekijk herstel informatie',
        loading: !! (buildingId.value && ! buildingRecoveryReportDataHasBeenRetrieved(
          buildingId.value
        )),
        disabled: !! (buildingId.value && ! buildingHasRecoveryReports(
          buildingId.value
        )),
        route: null
      },
      {
        slug: 'incidenten',
        panel: 'IncidentsPanel',
        icon: null,
        name: 'Bekijk incidenten',
        loading: !! (buildingId.value && ! buildingIncidentReportDataHasBeenRetrieved(
          buildingId.value
        )),
        disabled: !! (buildingId.value && ! buildingHasIncidentReports(
          buildingId.value
        )),
        route: null
      }
    ]
  }
)

/**
 * If the panel slug changed in the url, open the panel
 */
watch(
  () => route.params.panel,
  (slug) => {
    if (slug) {
      openPanelBySlug(slug as string)
    }
  }
)

// Wait before components are available
onMounted(() => {
  if (route.name === 'building-panel') {
    openPanelBySlug(route.params.panel as string)
  }
})

/**
 * Clear the selected building
 */
const handleCloseSideBar = function handleCloseSideBar() {
  isOpen.value = false

  // Delayed by leave animation duration
  setTimeout(() => {
    clearBuildingId()
  }, 300)
}

const openPanelBySlug = function openPanelBySlug(slug: string) {
  const TabMenuItem = BuildingMenuList.value.find(MenuItem => MenuItem.slug === slug)
  if (TabMenuItem) {
    handleOpenPanel(TabMenuItem.panel, TabMenuItem.slug)
    return
  }

  const ReportMenuItem = ReportMenuList.value.find(MenuItem => MenuItem.slug === slug)
  if (ReportMenuItem) {
    handleOpenPanel(ReportMenuItem.panel, ReportMenuItem.slug)
  }
}

/**
 * Open a panel with details
 */
const handleOpenPanel = function handleOpenPanel(name: string, slug: string) {
  selectedPanel.value = name
  isOpen.value = true
  rightPanelSlide.value = true

  // No redirect to self
  if (route.name !== 'building-panel' || route.params.panel !== slug) {
    router.push({
      name: 'building-panel',
      params: {
        buildingId: route.params.buildingId,
        mapsetId: route.params.mapsetId,
        panel: slug
      },
      query: route.query
    })
  }
}

/**
 * Slide back to the main menu
 */
const handleBackToMainMenu = function handleBackToMainMenu() {
  rightPanelSlide.value = false

  if (route.name === 'building-panel') {
    router.push({ name: 'building', params: route.params, query: route.query })
  }
}

</script>

<template>
  <div
    v-if="isOpen && hasSelectedBuilding && isAuthenticated"
    class="sidebar app-sidebar--right"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="panels transition-transform duration-300"
      :class="{'-translate-x-full': rightPanelSlide}"
    >
      <Panel
        v-if="failedToLoad"
        title="Pand Informatie"
        @close="handleCloseSideBar">
        <div class="flex flex-col items-center gap-4 py-8 text-center">
          <AlertIcon class="w-12 text-grey-400" aria-hidden="true" />
          <div class="space-y-1">
            <h5 class="heading-5 text-grey-700">Geen data beschikbaar</h5>
            <p class="text-sm text-grey-400">
              De informatie over dit pand kon niet geladen worden. Selecteer een ander pand op de kaart.
            </p>
          </div>
        </div>
      </Panel>
      <Panel
        v-else
        @close="handleCloseSideBar"
        title="Pand Informatie">

        <SkeletonLoader v-if="isLoadingCoreData" />

        <template v-else>
        <Transition>
          <BuildingIdHeader />
        </Transition>

        <MapsetDetails />

        <section class="grid space-y-4">
          <div class="flex justify-between">
            <h5 class="heading-5">Over het pand</h5>
          </div>
          <div class="grid space-y-2">
            <MenuLink
              v-for="MenuItem in BuildingMenuList"
              :key="MenuItem.name"
              :label="MenuItem.name"
              :disabled="MenuItem.disabled"
              :loading="MenuItem.loading"
              @click.prevent="handleOpenPanel(MenuItem.panel, MenuItem.slug)"
            >
              <FundermapsIcon
                :name="MenuItem.icon"
                class="accent-color-blue aspect-square w-6"
                aria-hidden="true"
              />
            </MenuLink>
          </div>
        </section>

        <section class="grid space-y-2">
          <OutlineButton
            v-for="MenuItem in ReportMenuList"
            :key="MenuItem.name"
            :label="MenuItem.name"
            :disabled="MenuItem.disabled || MenuItem.loading"
            class="w-full"
            @click.prevent="handleOpenPanel(MenuItem.panel, MenuItem.slug)"
          />

        </section>
        </template>

        <template v-slot:footer>
          <RightSideBarFooterLinks />
        </template>
      </Panel>

      <component
        :is="availablePanels[selectedPanel]"
        @close="handleCloseSideBar"
        @back="handleBackToMainMenu" />

    </div>
  </div>
</template>
