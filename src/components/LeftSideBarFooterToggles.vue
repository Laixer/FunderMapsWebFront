<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Toggle from '@/components/Common/Inputs/Toggle.vue'

import { useLayersStore } from "@/store/layers";
import { useFiltersStore } from "@/store/filters"

const { showAdministrativeBoundaries } = storeToRefs(useLayersStore())
const { applyOwnershipFilter } = storeToRefs(useFiltersStore())
</script>

<template>
  <div class="LayerToggleWrapper">
    <Toggle v-model="applyOwnershipFilter" label="Filter op eigendom" />
    <Toggle v-model="showAdministrativeBoundaries" label="Administratieve grenzen" />
  </div>
</template>

<style>

.LayerToggleWrapper {
  gap: .25rem;
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column
}
.LayerToggleWrapper .input__label {
  user-select: none;
}
</style>