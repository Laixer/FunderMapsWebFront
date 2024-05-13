<script setup lang="ts">
import { ComputedRef, computed, ref, type Ref } from 'vue';
import { storeToRefs } from 'pinia';

import AccordionGroup from '@/components/Common/Accordion/AccordionGroup.vue';
import AccordionItem from '@/components/Common/Accordion/AccordionItem.vue';
import MenuLink from '@/components/Common/Links/MenuLink.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';
import Panel from '@/components/Common/Panel.vue';
// import BlockLinkGroup from '@/components/Common/Links/BlockLinkGroup.vue';
// import BlockLink from '@/components/Common/Links/BlockLink.vue'

import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';
import InfoIcon from '@assets/svg/icons/info.svg'

import { useMainStore } from '@/store/main'
import { useMapsetStore } from '@/store/mapsets'
import { useLayersStore } from '@/store/layers';


const mapsetStore = useMapsetStore()
const {
  selectMapsetById
} = mapsetStore

const { isLeftSidebarOpen } = storeToRefs( useMainStore() )
const { availableMapsets, activeMapset, activeMapsetId } = storeToRefs( mapsetStore )
const { changeLayerVisibility } = useLayersStore() 
const { visibleLayersByMapsetId } = storeToRefs(useLayersStore())

/**
 * Whether to show the list of available mapsets
 *  defaults to false to first show the legend of the active mapset
 */
const showMapsetSelection: Ref<boolean> = ref(false)

/**
 * 
 */
const legendState: ComputedRef<Record<string, boolean>> = computed(() => {
  return (activeMapset.value?.layerSet || []).reduce((acc: Record<string, boolean>, layer) => {

    // No known mapset id = not visible. Not that there are any layers to go over with reduce... but TS!
    acc[layer.id] = activeMapset.value?.id 
      ? visibleLayersByMapsetId.value?.[activeMapset.value.id]?.includes(layer.id)
      : false

    // console.log("Visibility check", layer.id, acc[layer.id])

    return acc
  }, {})
})

/**
 * Change the selected mapset
 */
const handleOpenMapsetLegend = function handleOpenMapsetLegend(id: string) {
  if (id !== activeMapsetId.value) selectMapsetById(id)

  showMapsetSelection.value = false
}

/**
 * The legend is closed, but the mapset isn't changed until a new one is selected
 */ 
const handleCloseMapsetLegend = function handleCloseMapsetLegend() {
  showMapsetSelection.value = true
}

/**
 * TODO: the UI is for information, but this is not available in the API
 * TODO: The requirements specify a need to show a consent popup before showing some mapsets... would this be it? 
 */
const handleShowConsentModal = function handleShowConsentModal() {
  console.log("consent info of", activeMapset.value)
}

/**
 * If we're looking at a legend of the visible (active) mapset, 
 *  switch map layers upon opening a specific legend segment.
 */
const handleToggleLayerById = function handleOpenLayerById(layerId: string, visibility: boolean) {
  changeLayerVisibility(layerId, visibility, activeMapsetId.value)
}

</script>

<template>
  <div
    class="sidebar app-sidebar--left"
    role="dialog"
    aria-modal="true"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="-translate-x-full"
    x-transition:enter-end="translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="translate-x-0"
    x-transition:leave-end="-translate-x-full"
  >
    <div
      class="panels transition-transform duration-300"
      :class="{'-translate-x-full': showMapsetSelection === false}"
    >
      <Panel 
        subtitle="Selecteer een kaart"
        @close="isLeftSidebarOpen = false">
        <section class="grid space-y-2">
          <MenuLink 
            v-for="mapset in availableMapsets" 
            :key="mapset.id"
            :label="mapset.name"
            @click.prevent="handleOpenMapsetLegend(mapset.id)">
            <FundermapsIcon
              :name="mapset?.icon || 'home-info'"
              class="accent-color-blue aspect-square w-6"
              aria-hidden="true" 
            />
          </MenuLink>
        </section>

        <!-- <BlockLinkGroup>
          <BlockLink 
            title="Verhouding aantal fundering in de buurt"
            label="Bekijk grafiek" />
          <BlockLink 
            title="Verhouding aantal soorten risico's in de buurt"
            label="Bekijk grafiek" />
        </BlockLinkGroup> -->
      </Panel>

      <Panel
        @close="isLeftSidebarOpen = false">
        <template v-slot:subtitle>
          <FundermapsIcon
            :name="activeMapset?.icon || 'home-info'"
            class="accent-color-blue aspect-square w-6"
            aria-hidden="true" 
          />
          <h4 class="heading-4">
            {{ activeMapset?.name }}
            <button
              v-if="activeMapset?.consent"
              class="-ml-1 p-2 text-green-500 hover:text-green-700"
              type="button"
              @click.prevent="handleShowConsentModal"
            >
              <InfoIcon
                class="aspect-square w-4"
                aria-hidden="true"
              />
            </button>
          </h4>
        </template>

        <BackLink 
          label="Naar kaart selectie" 
          @click.prevent="handleCloseMapsetLegend" />
        
        <section class="space-y-2">

          <AccordionGroup v-if="activeMapset?.layerSet">
            <AccordionItem 
              v-for="layer in activeMapset.layerSet || []" 
              :key="`legend_${layer.id || layer.name}`"
              :title="layer.name || ''"
              :open="legendState[layer.id]"
              @toggle="(visibility: boolean) => activeMapset && handleToggleLayerById(layer.id, visibility)">
              <ol class="list--legenda">
                <li 
                  v-for="field in layer.fields"
                  :key="`field_${field.name}`" 
                  :style="`--marker-color: #${field.color}`">{{ field.name }}</li>
              </ol>
            </AccordionItem>
          </AccordionGroup>

        </section>
      </Panel>
    </div>
  </div>

</template>@/components/Mapbox/useMapboxControlNudge