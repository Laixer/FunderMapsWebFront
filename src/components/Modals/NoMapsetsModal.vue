<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Button from '@/components/Common/Buttons/Button.vue';
// import Modal from '@/components/Common/Modal.vue';
import OverlayModal from '@/components//Common/OverlayModal.vue';
import ExitIcon from '@assets/svg/icons/exit.svg'

import { useMapsetStore } from '@/store/mapsets'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session';


const { noMapsetsFound } = storeToRefs( useMapsetStore() )
const router = useRouter()
const sessionStore = useSessionStore()
const { isAuthenticated } = storeToRefs( useSessionStore() )

/**
 * Log the user out, and redirect to the login page
 */
const handleLogout = async function() {
  await sessionStore.logout()
  router.push({ name: 'login' })
}

</script>

<template>
  <OverlayModal 
    v-if="noMapsetsFound"
    title="Geen kaarten gevonden" 
    :closeable="false">

    <p>
      Er zijn geen kaarten waar u toegang toe heeft.
      <br />
      Neem contact op met de support afdeling voor meer informatie.
    </p>

    <template v-slot:footer>
      <Button 
        v-if="isAuthenticated" 
        @click.prevent="handleLogout" 
        label="Uitloggen">
        <template v-slot:before>
          <ExitIcon class="w-3" aria-hidden="true" />
        </template>
      </Button>
    </template>
  </OverlayModal>
</template>