<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '../Common/Links/BackLink.vue';

import BlockLinkGroup from '@/components/Common/Links/BlockLinkGroup.vue';
import BlockLink from '@/components/Common/Links/BlockLink.vue'


import { useStatisticsStore } from '@/store/building/statistics';
const { showStatisticsModal, statisticsGraph } = storeToRefs(useStatisticsStore())

/**
 * Props & events
 */ 
defineProps({ address: { type: String } })
const emit = defineEmits(['close', 'back'])

/**
 * Open the statistics modal
 */
const handleOpenChart = function handleOpenChart(name: string) {
  console.log("Open chart", name)
  statisticsGraph.value = name
  showStatisticsModal.value = true
}

</script>

<template>
  <Panel 
    title="Statistiek" 
    icon="graph"
    :subtitle="address || ''"
    @close="emit('close')">

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <BlockLinkGroup>
        <BlockLink 
          title="Verhouding aantal fundering in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('foundationTypeDistribution')" />
        <BlockLink 
          title="Verhouding aantal soorten risico's in de buurt"
          label="Bekijk grafiek"
          @click="handleOpenChart('constructionYearDistribution')" />
      </BlockLinkGroup>
    </section>
  </Panel>
</template>