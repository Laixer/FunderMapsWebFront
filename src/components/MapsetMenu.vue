<script setup lang="ts">


/******************************************************************************
 * 
 *    DEPRECIATED - REPLACED BY OrgsMenu
 * 
 *****************************************************************************/


import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { vOnClickOutside } from '@vueuse/components'

import Avatar from './Common/Avatar.vue';
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue';
import SwitchIcon from '@assets/svg/icons/switch.svg'
import CheckIcon from '@assets/svg/icons/check.svg'

import { useMapsetStore } from '@/store/mapsets'
const MapsetStore = useMapsetStore()

const {
  selectMapsetById
} = MapsetStore

const { 
  availableMapsets,
  hasAvailableMapsets, 
  activeMapset, 
  activeMapsetId
} = storeToRefs( MapsetStore )

/**
 * Whether the menu is open
 */
const isOpen = ref(false)

/**
 * Toggle / close the menu open state
 */
const handleToggle = function handleToggle() {
  isOpen.value = ! isOpen.value
}
const handleClose = function handleClose() {
  isOpen.value = false
}

/**
 * Activate a Map Group
 *  The Main component watches for changes and will navigate accordingly
 */
const handleSelectMapset = function(id: string) {
  selectMapsetById(id)
  handleClose()
}

</script>
<template>
  <div> <!-- extra div for Transition in parent component -->
    <div 
      v-if="hasAvailableMapsets && activeMapset"
      v-on-click-outside="handleClose"
      class="relative">

      <button 
        v-if="availableMapsets.length !== 1"
        @click.prevent="handleToggle" 
        class="button group flex p-0">

        <Avatar class="aspect-square w-10 rounded-full" :name="activeMapset.name" />

        <div class="flex flex-col items-start">
          <h2 class="heading-5">{{ activeMapset.name }}</h2>
          <div
            class="flex gap-2 text-sm font-bold text-green-500 group-hover:text-blue-500"
          >
            <SwitchIcon 
              class="aspect-square w-4"
              aria-hidden="true"
            />
            Wijzig kaartgroep
          </div>
        </div>
      </button>

      <div v-else class="flex gap-2 p-0">
        <Avatar class="aspect-square w-10 rounded-full" :name="activeMapset.name" />
        <div class="flex items-center">
          <h2 class="heading-5">{{ activeMapset.name }}</h2>
        </div>
      </div>

      <Transition>
        <div
          v-if="isOpen && availableMapsets.length !== 1"
          class="dropdown arrow arrow--top-left | absolute -left-7 top-full origin-top-left outline-none"
        >
          <div
            class="dropdown__main | relative grid rounded-lg bg-white py-4 shadow-float"
          >
            <div
              class="dropdown__header | flex items-baseline justify-between gap-6 px-8 pb-2 pt-3"
            >
              <h3 class="heading-5 whitespace-nowrap">Mijn kaartengroepen</h3>
              <CloseBtn 
                class="-translate-y-3 translate-x-3 p-0"
                @close="handleClose" />
            </div>
            <div class="dropdown__content">
              <ol>
                <li v-for="Mapset in availableMapsets" :key="Mapset.id">
                  <a
                    href="#"
                    class="flex gap-3 px-8 py-2 hover:bg-grey-100"
                    :class="{'bg-grey-100': Mapset.id === activeMapsetId}"
                    @click.prevent="handleSelectMapset(Mapset.id)"
                  >
                    <figure class="relative">
                      <Avatar class="aspect-square w-8 rounded-full" :name="Mapset.name" />

                      <div
                        v-if="Mapset.id === activeMapsetId"
                        class="absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-full border border-white bg-blue-500 p-1 text-white"
                      >
                        <CheckIcon
                          class="aspect-square w-2"
                          aria-hidden="true" 
                        />
                      </div>
                    </figure>
                    <div>
                      <h6 class="heading-6 leading-none">{{ Mapset.name }}</h6>
                      <div 
                        v-if="Mapset.id === activeMapsetId"
                        class="flex gap-2 text-sm text-blue-500">Geselecteerd</div>
                      <div 
                        v-else
                        class="flex gap-2 text-sm text-green-500">
                        <SwitchIcon
                          class="aspect-square w-4"
                          aria-hidden="true" 
                        />
                        Naar deze Kaartgoep
                      </div>
                    </div>
                  </a>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>