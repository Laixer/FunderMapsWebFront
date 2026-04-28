<script setup lang="ts">
import { ref, type Component } from 'vue';
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
import BuildingErrorPanel from '@/components/Building/BuildingErrorPanel.vue';
import MapsetDetails from '@/components/Building/MapsetDetails.vue';

import RightSideBarFooterLinks from '@/components/RightSideBarFooterLinks.vue';

import { useSessionStore } from '@/store/session';
import { useBuildingStore } from '@/store/buildings';
import { useBuildingData } from './useBuildingData';
import { useBuildingMenu } from './useBuildingMenu';
import { usePanelRouting } from './usePanelRouting';


const { isAuthenticated } = storeToRefs(useSessionStore())
const { clearBuildingId } = useBuildingStore()
const { hasSelectedBuilding } = storeToRefs(useBuildingStore())

const { failedToLoad, isLoadingCoreData, startWatching } = useBuildingData()
const { buildingMenu, reportMenu } = useBuildingMenu()
const { selectedPanel, rightPanelSlide, openPanel, backToMainMenu } =
  usePanelRouting([buildingMenu, reportMenu])

const availablePanels: Record<string, Component> = {
  BuildingPanel,
  FoundationPanel,
  FoundationRiskPanel,
  IncidentsPanel,
  InquiryPanel,
  LocationPanel,
  RecoveryPanel,
  StatisticsPanel,
}

const isOpen = ref(false)

startWatching(() => { isOpen.value = true })

const handleCloseSideBar = (): void => {
  isOpen.value = false
  // Delay clearing the building id until the leave animation finishes.
  setTimeout(() => { clearBuildingId() }, 300)
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
      <BuildingErrorPanel
        v-if="failedToLoad"
        @close="handleCloseSideBar"
      />
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
                v-for="MenuItem in buildingMenu"
                :key="MenuItem.name"
                :label="MenuItem.name"
                :disabled="MenuItem.disabled"
                :loading="MenuItem.loading"
                @click.prevent="openPanel(MenuItem.panel, MenuItem.slug)"
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
              v-for="MenuItem in reportMenu"
              :key="MenuItem.name"
              :label="MenuItem.name"
              :disabled="MenuItem.disabled || MenuItem.loading"
              class="w-full"
              @click.prevent="openPanel(MenuItem.panel, MenuItem.slug)"
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
        @back="backToMainMenu" />
    </div>
  </div>
</template>
