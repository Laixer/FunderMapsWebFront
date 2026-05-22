<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Button from '@/components/Common/Buttons/Button.vue';
import OverlayModal from '@/components/Common/OverlayModal.vue';
import ExitIcon from '@assets/svg/icons/exit.svg'

import { useMapsetStore } from '@/store/mapsets'
import { useSessionStore } from '@/store/session';
import { logoutRedirect } from '@/services/oidc'


const { noMapsetsFound } = storeToRefs( useMapsetStore() )
const { isAuthenticated } = storeToRefs( useSessionStore() )

/**
 * Log the user out. RP-initiated (ends the SSO session at the provider), not a
 * local-only clear — otherwise the next /authorize silently re-signs-in the
 * same no-mapsets user, defeating the point of this button (switch accounts).
 * Matches UserMenu's logout.
 */
const handleLogout = function() {
  logoutRedirect()
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