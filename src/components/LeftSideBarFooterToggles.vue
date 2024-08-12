<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

import Toggle from '@/components/Common/Inputs/Toggle.vue'

import { useLayersStore } from "@/store/layers";
import { useFiltersStore } from "@/store/filters"

const { showAdministrativeBoundaries } = storeToRefs(useLayersStore())
const { applyOwnershipFilter } = storeToRefs(useFiltersStore())

const Ownership = defineModel('Ownership')
const AdministrativeBoundaries = defineModel('AdministrativeBoundaries')

/**
 * TODO: Not at the right place. Refactor to user meta once available in API.
 */
if (localStorage.getItem("administative-boundaries") === 'true') {
  AdministrativeBoundaries.value = true
}
if (localStorage.getItem("ownership-filter") === 'true') {
  Ownership.value = true
}

// TODO: Refactor after localstorage change
watch(Ownership, (value) => {
  console.log("Ownerschip", value)
  applyOwnershipFilter.value = value === true
  localStorage.setItem("ownership-filter", value === true ? 'true' : 'false')
}, { immediate: true })

watch(AdministrativeBoundaries, (value) => {
  showAdministrativeBoundaries.value = value === true
  localStorage.setItem("administative-boundaries", value === true ? 'true' : 'false')
}, { immediate: true })
</script>

<template>
  <div class="LayerToggleWrapper">
    <Toggle v-model="Ownership" label="Filter op eigendom" />
    <Toggle v-model="AdministrativeBoundaries" label="Administratieve grenzen" />
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