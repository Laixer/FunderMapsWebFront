<script setup lang="ts">

import OverlayModal from '@/components/Common/OverlayModal.vue'

</script>

<template>

  <OverlayModal 
    title="Stats"
    class="xl:pointer-events-none xl:bg-transparent">
    <div x-data="chartLine" class="w-full">
      <canvas x-ref="canvas" class="chart"></canvas>
    </div>
  </OverlayModal>
</template>