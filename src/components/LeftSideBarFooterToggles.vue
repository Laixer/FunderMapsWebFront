<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Toggle from '@/components/Common/Inputs/Toggle.vue'

import { useLayersStore } from "@/store/layers";
import { useFiltersStore } from "@/store/filters"

const { showAdministrativeBoundaries, showBuildingCluster } = storeToRefs(useLayersStore())
const { applyOwnershipFilter } = storeToRefs(useFiltersStore())
</script>

<template>
  <div class="flex flex-col gap-1 px-5">
    <Toggle v-model="applyOwnershipFilter" label="Filter op eigendom" />
    <Toggle v-model="showAdministrativeBoundaries" label="Administratieve grenzen" />
    <Toggle v-model="showBuildingCluster" label="Bouwkundige eenheid" />
  </div>
</template>