<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { vOnClickOutside } from '@vueuse/components'

import Avatar from '@/components/Common/Avatar.vue'
import ChevronDownIcon from '@assets/svg/icons/chevron-down.svg'
import CheckIcon from '@assets/svg/icons/check.svg'

import { useSessionStore } from '@/store/session';

const sessionStore = useSessionStore()
const { selectOrgById } = sessionStore
const { organizations, selectedOrg, selectedOrgId } = storeToRefs(sessionStore)

const isOpen = ref(false)

const handleToggle = function handleToggle() {
  isOpen.value = !isOpen.value
}
const handleClose = function handleClose() {
  isOpen.value = false
}

const handleSelectOrg = function handleSelectOrg(id: string) {
  selectOrgById(id)
  handleClose()
}

</script>
<template>
  <div> <!-- extra div for Transition in parent component -->
    <div
      v-if="organizations.length > 0 && selectedOrg"
      v-on-click-outside="handleClose"
      class="relative">

      <button
        v-if="organizations.length > 1"
        type="button"
        class="button group flex items-center gap-2 p-0"
        :aria-label="`Wijzig organisatie, huidig: ${selectedOrg.name}`"
        aria-haspopup="true"
        :aria-expanded="isOpen"
        @click.prevent="handleToggle"
      >
        <h2 class="heading-5 transition-colors group-hover:text-green-500">{{ selectedOrg.name }}</h2>
        <ChevronDownIcon
          class="h-2.5 w-2.5 text-grey-500 transition-[transform,color] duration-200 group-hover:text-green-500"
          :class="{ 'rotate-180': isOpen }"
          aria-hidden="true"
        />
      </button>

      <h2 v-else class="heading-5">{{ selectedOrg.name }}</h2>

      <Transition name="slide-down">
        <div
          v-if="isOpen && organizations.length > 1"
          class="dropdown arrow arrow--top-left | absolute -left-3 top-full z-20 min-w-56 origin-top-left outline-none"
        >
          <div class="dropdown__main | rounded-lg bg-white py-2 shadow-float">
            <ol>
              <li v-for="org in organizations" :key="org.id">
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors duration-100 hover:bg-grey-100"
                  :class="{ 'bg-grey-100': org.id === selectedOrgId }"
                  @click.prevent="handleSelectOrg(org.id)"
                >
                  <Avatar class="aspect-square w-7 rounded-full text-xs" :name="org.name" />
                  <span class="heading-6 flex-1 leading-none">{{ org.name }}</span>
                  <CheckIcon
                    v-if="org.id === selectedOrgId"
                    class="aspect-square w-3 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                </button>
              </li>
            </ol>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
