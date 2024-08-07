<script setup lang="ts">

import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { vOnClickOutside } from '@vueuse/components'

import Avatar from '@/components/Common/Avatar.vue'
import LinkButton from '@/components/Common/Buttons/LinkButton.vue';
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';

import ExitIcon from '@assets/svg/icons/exit.svg'
import ArrowRightIcon from '@assets/svg/icons/arrow-right.svg'
import ChevronDownIcon from '@assets/svg/icons/chevron-down.svg'

import { useSessionStore } from '@/store/session';
import { useMainStore } from '@/store/main'
import { useRouter } from 'vue-router'

const router = useRouter()
const sessionStore = useSessionStore()
const { isProfileModalOpen, isPasswordModalOpen } = storeToRefs( useMainStore() )
const { isAuthenticated, currentUser } = storeToRefs( sessionStore )

/**
 * Component related data
 */
const isOpen = ref(false)
const userName = currentUser.value?.name || 'Onbekend'

/**
 * Open & close the menu
 */
const handleToggleMenu = function handleToggleMenu() {
  isOpen.value = ! isOpen.value
}
const handleClose = function handleClose() {
  isOpen.value = false
}

/**
 * Open the Profile modal, and close the menu
 *  Note: The profile popup has no navigation attached
 */
const handleOpenProfileModal = function() {
  isPasswordModalOpen.value = false
  isProfileModalOpen.value = true
  isOpen.value = false
}

/**
 * Open the Password modal, and close the menu
 *  Note: The password popup has no navigation attached
 */
const handleOpenPasswordModal = function() {
  isProfileModalOpen.value = false
  isPasswordModalOpen.value = true
  isOpen.value = false
}

/**
 * Log the user out, and redirect to the login page
 * 
 * Note: 
 *  There is no redirect to login. This is intentional.
 *  We let the data store decide. 
 *  Perhaps there will still be a public mapset available.
 */
const handleLogout = async function() {
  await sessionStore.logout()
  isOpen.value = false
}

/**
 * Redirect to the login page
 */
const handleLoginRedirect = function handleLoginRedirect() {
  router.push({ name: 'login' })
}

</script>

<template>
  <div class="relative" v-on-click-outside="handleClose">

    <LinkButton 
      v-if="! isAuthenticated"
      label="Inloggen"
      class="transition-colors hover:text-green-500"
      @click.prevent="handleLoginRedirect">
      <template v-slot:after>
        <ArrowRightIcon 
          class="aspect-square h-3.5" 
          aria-hidden="true" />
      </template>
    </LinkButton> 

    <button 
      v-else 
      class="button group p-0 pr-2.5"
      @click="handleToggleMenu">
      <Avatar :name="userName" />

      <ChevronDownIcon 
        class="h-2.5 w-2.5 transition-transform"
        :class="{'rotate-180': isOpen}"
        aria-hidden="true" />
    </button>

    <div 
      v-show="isOpen && isAuthenticated"
      class="dropdown arrow arrow--top-right | absolute right-0 top-full z-20 min-w-48 origin-top-right outline-none">
      <div class="dropdown__main | divide-y divide-grey-200 rounded-lg bg-white py-1 shadow-float">

        <a
          href="#"
          @click.prevent="handleOpenProfileModal"
          class="group flex w-full cursor-pointer items-center justify-between gap-2 px-8 py-4 transition-colors hover:text-green-500"
          :class="{'text-green-500': isProfileModalOpen}"
        >
          <span class="whitespace-nowrap">Ga naar profiel</span>
          <AnimatedArrowIcon />
        </a>

        <a
          href="#"
          @click.prevent="handleOpenPasswordModal"
          class="group flex w-full cursor-pointer items-center justify-between gap-2 px-8 py-4 transition-colors hover:text-green-500"
          :class="{'text-green-500': isPasswordModalOpen}"
        >
          <span class="whitespace-nowrap">Wijzig wachtwoord</span>
          <AnimatedArrowIcon />
        </a>

        <a
          href="#"
          @click.prevent="handleLogout"
          class="flex w-full items-center gap-2 px-8 py-4 transition-colors hover:text-red-500"
        >
          <ExitIcon 
            class="aspect-square h-3.5" 
            aria-hidden="true" />
          <span>Uitloggen</span>
        </a>
      </div>
    </div>
  </div>

</template>