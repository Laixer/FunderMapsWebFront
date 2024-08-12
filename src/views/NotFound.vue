<script setup lang="ts">
import Header from '@/components/Layout/Header.vue'
import OverlayModal from '@/components/Common/OverlayModal.vue';
import Button from '@/components/Common/Buttons/Button.vue';

import { useRouter } from 'vue-router'
const router = useRouter()

import MapBox from '@/components/Common/Mapbox/MapBox.vue';

const options = {
  style: 'mapbox://styles/mapbox/standard',
  center: [4.503663, 52.530826], 
  zoom: 15,
  pitch: 45,
  bearing: 0,
  antialias: true,
  attributionControl: false,
  interactive: false
}
</script>

<template>

  <div class="page-dashboard">
    <Header />

    <div
      class="app-view | map-placeholder-bg relative bg-grey-200"
    >

      <MapBox 
        :options="options" />
    </div>

    <OverlayModal 
      title="Oh nee! Deze pagina is verzakt (404)" 
      :closeable="false">

      <p>
        Het lijkt erop dat deze pagina niet op stevige grond staat en in een gat is gevallen.
      </p>

      <p>
        Ga terug naar de homepage voor een stabiele basis.
      </p>

      <template v-slot:footer>
        <Button 
          @click.prevent="router.push({ name: 'home' })" 
          label="Home">
        </Button>
      </template>

    </OverlayModal>
  </div>

</template>