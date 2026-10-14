<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Toggle from '@/components/Common/Inputs/Toggle.vue'

import { useLayersStore } from "@/store/layers";
import { useFiltersStore } from "@/store/filters"
import { useSessionStore } from '@/store/session';

const { showBuildingCluster, isBuildingClusterInLegend } = storeToRefs(useLayersStore())
const { applyOwnershipFilter, noOwnedBuildingsInView } = storeToRefs(useFiltersStore())
const { selectedOrg } = storeToRefs(useSessionStore())
</script>

<template>
  <div class="flex flex-col gap-1 px-5">
    <!-- The filter matches on the name of the user's organisation: without
         one (a guest) the switch would turn on and do nothing -->
    <div v-if="selectedOrg">
      <Toggle v-model="applyOwnershipFilter" label="Filter op eigendom" />

      <!-- Always in the page, so that a screen reader says the message when it appears -->
      <div role="status">
        <p
          v-if="applyOwnershipFilter && noOwnedBuildingsInView"
          class="pb-1 pl-12 text-sm text-(--color-text-muted)">Geen panden van {{ selectedOrg?.name }} in beeld.</p>
      </div>
    </div>

    <!-- A mapset with "Bouwkundige eenheid" in its legend has its control there -->
    <Toggle
      v-if="! isBuildingClusterInLegend"
      v-model="showBuildingCluster"
      label="Bouwkundige eenheid" />
  </div>
</template>