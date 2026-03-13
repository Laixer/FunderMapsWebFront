<script setup lang="ts">
import { ComputedRef, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import VueMarkdown from 'vue-markdown-render'

import AccordionGroup from '@/components/Common/Accordion/AccordionGroup.vue';
import AccordionItem from '@/components/Common/Accordion/AccordionItem.vue';
import MenuLink from '@/components/Common/Links/MenuLink.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';
import Panel from '@/components/Common/Panel.vue';

import LeftSideBarFooterToggles from '@/components/LeftSideBarFooterToggles.vue'

import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';
import InfoIcon from '@assets/svg/icons/info.svg'

import { useMainStore } from '@/store/main'
import { useMapsetStore } from '@/store/mapsets'
import { useLayersStore } from '@/store/layers';


const mapsetStore = useMapsetStore()
const {
  selectMapsetById
} = mapsetStore

const { isLeftSidebarOpen, isShowingMapsetSelection } = storeToRefs( useMainStore() )
const showInfoTooltip = ref(false)
const { availableMapsetsByLoadingOrder, activeMapset, activeMapsetId } = storeToRefs( mapsetStore )
const { changeLayerVisibility } = useLayersStore() 
const { visibleLayersByMapsetId } = storeToRefs(useLayersStore())


/**
 * 
 */
const legendState: ComputedRef<Record<string, boolean>> = computed(() => {
  return (activeMapset.value?.layerSet || []).reduce((acc: Record<string, boolean>, layer) => {

    // No known mapset id = not visible. Not that there are any layers to go over with reduce... but TS!
    acc[layer.id] = activeMapset.value?.id 
      ? visibleLayersByMapsetId.value?.[activeMapset.value.id]?.includes(layer.id)
      : false
      
    return acc
  }, {})
})

/**
 * Change the selected mapset
 */
const handleOpenMapsetLegend = function handleOpenMapsetLegend(id: string) {
  if (id !== activeMapsetId.value) selectMapsetById(id)

  isShowingMapsetSelection.value = false
}

/**
 * The legend is closed, but the mapset isn't changed until a new one is selected
 */ 
const handleCloseMapsetLegend = function handleCloseMapsetLegend() {
  isShowingMapsetSelection.value = true
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
  >
    <div
      class="panels transition-transform duration-300"
      :class="{'-translate-x-full': isShowingMapsetSelection === false}"
    >
      <Panel 
        subtitle="Selecteer een kaart"
        @close="isLeftSidebarOpen = false">
        <section class="grid space-y-2">
          <MenuLink
            v-for="mapset in availableMapsetsByLoadingOrder"
            :key="mapset.id"
            :label="mapset.name"
            :active="mapset.id === activeMapsetId"
            @click.prevent="handleOpenMapsetLegend(mapset.id)">
            <FundermapsIcon
              :name="mapset?.icon || 'home-info'"
              class="accent-color-blue aspect-square w-6"
              aria-hidden="true" 
            />
          </MenuLink>
        </section>

        <template v-slot:footer>  
          <LeftSideBarFooterToggles />
        </template>
      </Panel>

      <Panel
        @close="isLeftSidebarOpen = false">
        <template v-slot:subtitle>
          <FundermapsIcon
            :name="activeMapset?.icon || 'home-info'"
            class="accent-color-blue aspect-square w-6"
            aria-hidden="true" 
          />
          <h4 class="heading-4 flex items-center gap-1">
            {{ activeMapset?.name }}
            <span
              v-if="activeMapset?.note"
              class="relative"
              @mouseenter="showInfoTooltip = true"
              @mouseleave="showInfoTooltip = false"
            >
              <button
                class="p-1 text-green-500 hover:text-green-700"
                type="button"
                @click.prevent="showInfoTooltip = !showInfoTooltip"
              >
                <InfoIcon
                  class="aspect-square w-4"
                  aria-hidden="true"
                />
              </button>
              <Teleport to="body">
                <Transition name="short">
                  <div
                    v-if="showInfoTooltip"
                    class="fixed top-[5rem] z-50 ml-2 mt-2 w-72 rounded-lg bg-white p-5 shadow-float"
                    style="left: var(--sidebar-width)"
                  >
                    <h6 class="heading-6 mb-2">{{ activeMapset?.name }}</h6>
                    <VueMarkdown
                      :source="activeMapset?.note ?? ''"
                      :options="{ breaks: true, linkify: true }"
                      class="text-sm leading-relaxed text-grey-700"
                    />
                  </div>
                </Transition>
              </Teleport>
            </span>
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
                  :style="`--marker-color: #${field.color}`">{{ field.name.length === 1 ? `Label ${field.name}` : field.name }}</li>
              </ol>
            </AccordionItem>
          </AccordionGroup>

        </section>
      </Panel>
    </div>
  </div>

</template>