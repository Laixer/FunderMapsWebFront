<script setup lang="ts">

// TODO: Split component further into sub components - 2 menu's - and move data loading to composable or store

import { ComputedRef, Ref, computed, onMounted, ref, watch, type Component } from 'vue';
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import MenuLink from '@/components/Common/Links/MenuLink.vue';
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';
import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';

import BuildingPanel from '@/components/Building/BuildingPanel.vue';
import FoundationPanel from '@/components/Building/FoundationPanel.vue';
import FoundationRiskPanel from '@/components/Building/FoundationRiskPanel.vue';
import IncidentsPanel from '@/components/Building/IncidentsPanel.vue';
import InquiryPanel from '@/components/Building/InquiryPanel.vue';
import LocationPanel from '@/components/Building/LocationPanel.vue';
import RecoveryPanel from '@/components/Building/RecoveryPanel.vue';
import StatisticsPanel from '@/components/Building/StatisticsPanel.vue';

import RightSideBarFooterLinks from '@/components/RightSideBarFooterLinks.vue';

import { useBuildingStore } from "@/store/buildings";
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useAnalysisStore } from '@/store/building/analysis'
import { useRecoveryReportsStore } from '@/store/building/recovery'
import { useInquiriesStore } from '@/store/building/inquiries'
import { useIncidentReportsStore } from '@/store/building/incidents'
import { useStatisticsStore } from '@/store/building/statistics'

import api from '@/services/api';
import MapsetDetails from '../Building/MapsetDetails.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const { clearBuildingId } = useBuildingStore()

/**
 * Menu items
 */
const { 
  loadLocationDataByBuildingId, 
  getFullAddressByBuildingId
} = useGeoLocationsStore()

const { 
  loadAnalysisDataByBuildingId
} = useAnalysisStore()

const { 
  loadStatisticsDataByBuildingId
} = useStatisticsStore()

/**
 * Green buttons
 */
const { 
  buildingRecoveryReportDataHasBeenRetrieved,
  buildingHasRecoveryReports,
  setRecoveryDataByBuildingId
} = useRecoveryReportsStore()

const { 
  buildingInquiryDataHasBeenRetrieved,
  buildingHasInquiries,
  setInquiryDataByBuildingId
} = useInquiriesStore()

const { 
  buildingIncidentReportDataHasBeenRetrieved,
  buildingHasIncidentReports,
  setIncidentDataByBuildingId
} = useIncidentReportsStore()


const { hasSelectedBuilding, buildingId } = storeToRefs(useBuildingStore())


const isOpen = ref(false)



const rightPanelSlide = ref(false)

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
const selectedPanel: Ref<string> = ref('')

/**
 * The full address of the selected building
 *  TODO: watch failed to load Geolocation data => show modal ?
 */
const fullAddress: ComputedRef<string|null> = computed(
  () => {
    if (buildingId.value === null) return null
    return getFullAddressByBuildingId(buildingId.value) // || "De pand informatie wordt opgehaald"
  }
)

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
        disabled: false,
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
 * When the selected building changes, we put the stores to work
 */
watch(
  () => buildingId.value,
  async (buildingId) => {
    if (buildingId === null) return

    isOpen.value = true

    // TODO: Quick fix to support cache. Move to some store ?
    const getAllReportDataUnlessCached = async function getAlReportDataUnlessCached(buildingId: string) {
      if (
        ! buildingRecoveryReportDataHasBeenRetrieved(buildingId) ||
        ! buildingIncidentReportDataHasBeenRetrieved(buildingId) ||
        ! buildingInquiryDataHasBeenRetrieved(buildingId)
      ) {
        return await api.building.getAllReportDataByBuildingId(buildingId)
          .then(response => {

            if (! buildingRecoveryReportDataHasBeenRetrieved(buildingId)) {
              setRecoveryDataByBuildingId(buildingId, response.recoveries, response.recoverySamples)
            }
            if (! buildingInquiryDataHasBeenRetrieved(buildingId)) {
              setInquiryDataByBuildingId(buildingId, response.inquiries, response.inquirySamples)
            }
            if (! buildingIncidentReportDataHasBeenRetrieved(buildingId)) {
              setIncidentDataByBuildingId(buildingId, response.incidents)
            }
          })
      }

      return Promise.resolve()
    }

    // TODO: Handle errors here ?
    // TODO: Retry logic. Local or global?
    await Promise.all([
      loadLocationDataByBuildingId(buildingId),
      loadAnalysisDataByBuildingId(buildingId),
      loadStatisticsDataByBuildingId(buildingId),

      // TODO: This implementation is a quick fix to support "cache"
      getAllReportDataUnlessCached(buildingId)
    ])
  },
  { immediate: true }
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
 *  TODO: also close & clear open details panel ?
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
    class="sidebar app-sidebar--right"
    role="dialog"
    aria-modal="true"
    v-show="isOpen && hasSelectedBuilding"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="translate-x-full"
    x-transition:enter-end="translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="translate-x-0"
    x-transition:leave-end="translate-x-full"
  >
    <div
      class="panels transition-transform duration-300"
      :class="{'-translate-x-full': rightPanelSlide}"
    >
      <Panel 
        @close="handleCloseSideBar" 
        title="Pand Informatie">
        <Transition>
          <div 
            v-if="fullAddress"
            class="flex items-center gap-3">
            <h4 class="heading-4">{{ fullAddress }}</h4>
          </div>
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
          >
            <template v-slot:after>
              <AnimatedArrowIcon />
            </template>
          </OutlineButton>
        </section>
      
        <template v-slot:footer>  
          <RightSideBarFooterLinks />
        </template>
      </Panel>

      <component 
        :is="availablePanels[selectedPanel]"
        :address="fullAddress"
        @close="handleCloseSideBar"
        @back="handleBackToMainMenu" />
      
    </div>
  </div>
</template>