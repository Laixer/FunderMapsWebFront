<script setup lang="ts">
import { ComputedRef, Ref, computed, ref, watch, type Component } from 'vue';
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

import AlertIcon from '@assets/svg/icons/alert.svg'
import ChatIcon from '@assets/svg/icons/chat.svg'

import { useBuildingStore } from "@/store/buildings";
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useAnalysisStore } from '@/store/building/analysis'
import { useRecoveryReportsStore } from '@/store/building/recovery'
import { useInquiriesStore } from '@/store/building/inquiries'
import { useIncidentReportsStore } from '@/store/building/incidents'
import { useStatisticsStore } from '@/store/building/statistics'

import { useMapboxControlNudge } from '@/components/Layout/useMapboxControlNudge'
import api from '@/services/api';
import MapsetDetails from '../Building/MapsetDetails.vue';

const { clearBuildingId } = useBuildingStore()

/**
 * Menu items
 */
const { 
  loadLocationDataByBuildingId, 
  getFullAddressByBuildingId, 
  // buildingLocationDataHasBeenRetrieved, 
  // buildingHasLocationData 
} = useGeoLocationsStore()

const { 
  loadAnalysisDataByBuildingId,
  // buildingAnalysisDataHasBeenRetrieved,
  // buildingHasAnalysisData 
} = useAnalysisStore()

const { 
  loadStatisticsDataByBuildingId,
  // buildingStatisticsDataHasBeenRetrieved,
  // buildingHasStatisticsData
} = useStatisticsStore()

/**
 * Green buttons
 */
const { 
  // loadRecoveryReportDataByBuildingId,
  buildingRecoveryReportDataHasBeenRetrieved,
  buildingHasRecoveryReports,
  setRecoveryDataByBuildingId
} = useRecoveryReportsStore()

const { 
  // loadInquiryDataByBuildingId,
  buildingInquiryDataHasBeenRetrieved,
  buildingHasInquiries,
  setInquiryDataByBuildingId
} = useInquiriesStore()

const { 
  // loadIncidentReportDataByBuildingId,
  buildingIncidentReportDataHasBeenRetrieved,
  buildingHasIncidentReports,
  setIncidentDataByBuildingId
} = useIncidentReportsStore()


const { hasSelectedBuilding, buildingId } = storeToRefs(useBuildingStore())

useMapboxControlNudge('right', 336, hasSelectedBuilding)

const isOpen = ref(false)


// TODO: Split component in multiple sub components
// TODO: Computed based on route name
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

// TODO: Move menu lists to separate components
// TODO: Add route names 
const BuildingMenuList = computed(
  () => {
    return [
      {
        panel: 'BuildingPanel',
        icon: 'building',
        name: 'Pand',
        loading: false,
        disabled: false,
        // loading: !! (buildingId.value && ! buildingAnalysisDataHasBeenRetrieved(
        //   buildingId.value
        // )),
        // disabled: !! (buildingId.value && ! buildingHasAnalysisData(
        //   buildingId.value
        // )),
        route: null
      },
      {
        panel: 'LocationPanel',
        icon: 'pin',
        name: 'Locatie',
        loading: false,
        disabled: false,
        // loading: !! (buildingId.value && ! buildingLocationDataHasBeenRetrieved(
        //   buildingId.value
        // )),
        // disabled: !! (buildingId.value && ! buildingHasLocationData(
        //   buildingId.value
        // )),
        route: null
      },
      {
        panel: 'FoundationPanel',
        icon: 'file-foundation',
        name: 'Fundering',
        loading: false,
        disabled: false,
        // loading: !! (buildingId.value && ! buildingAnalysisDataHasBeenRetrieved(
        //   buildingId.value
        // )),
        // disabled: !! (buildingId.value && ! buildingHasAnalysisData(
        //   buildingId.value
        // )),
        route: null
      },
      {
        panel: 'StatisticsPanel',
        icon: 'graph',
        name: 'Statistiek',
        loading: false,
        disabled: false,
        // !! (buildingId.value && ! buildingStatisticsDataHasBeenRetrieved(
        //   buildingId.value
        // )),
        // !! (buildingId.value && ! buildingHasStatisticsData(
        //   buildingId.value
        // )),
        route: null
      },
      // TODO: There is currently no endpoint available to retrieve this data 
      {
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

const ReportMenuList = computed(
  () => {
    return [
      {
        panel: 'InquiryPanel',
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
        panel: 'RecoveryPanel',
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
        panel: 'IncidentsPanel',
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

            console.log("Collective report response")
            console.log(response)

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

      // loadRecoveryReportDataByBuildingId(buildingId), // bundle? 
      // loadInquiryDataByBuildingId(buildingId),  // bunlde? 
      // loadIncidentReportDataByBuildingId(buildingId), // bundle?
      
      // All together now
      // TODO: Quick fix to support cache
      getAllReportDataUnlessCached(buildingId)
    ])
  }
)

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

/**
 * Open a panel with details
 */
const handleOpenPanel = function handleOpen(name: string) {
  selectedPanel.value = name
  isOpen.value = true
  rightPanelSlide.value = true
}

/**
 * Slide back to the main menu
 */
const handleBackToMainMenu = function handleBackToMainMenu() {
  rightPanelSlide.value = false
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
              @click.prevent="handleOpenPanel(MenuItem.panel)"
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
            @click.prevent="handleOpenPanel(MenuItem.panel)"
          >
            <template v-slot:after>
              <AnimatedArrowIcon />
            </template>
          </OutlineButton>
        </section>
      
        <!-- TODO: Move footer to separate component -->
        <template v-slot:footer>
          <div class="flex flex-col w-100 gap-2" style="width: 100%">

            <!-- <a
              href=""
              class="link link--outline | group flex-1 justify-center px-2 py-0.5"
            >
              <FundermapsIcon
                name="file-pdf"
                class="aspect-square w-3 group-hover:text-green-500"
                aria-hidden="true"
              />
              <strong>PDF downloaden</strong>
            </a>
            -->

            <div class="flex gap-2" style="width: 100%">
              <a
                href=""
                class="link link--outline | group flex-1 justify-center px-2 py-0.5"
              >
                <AlertIcon
                  class="aspect-square w-3 group-hover:text-green-500"
                  aria-hidden="true"
                />
                <strong>Incident melden</strong>
              </a>
              <a
                href=""
                class="link link--outline | group flex-grow justify-center px-2 py-0.5"
              >
                <ChatIcon
                  class="aspect-square w-3 group-hover:text-green-500"
                  aria-hidden="true"
                />
                <strong>Feedback</strong>
              </a>
            </div>
          </div>
        </template>
      </Panel>

      <!-- TODO: Add sub panels -->
      <component 
        :is="availablePanels[selectedPanel]"
        :address="fullAddress"
        @close="handleCloseSideBar"
        @back="handleBackToMainMenu" />
      
    </div>
  </div>
</template>