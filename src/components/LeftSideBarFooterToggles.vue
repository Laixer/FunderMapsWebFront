<script setup lang="ts">
import { watch } from 'vue';
import Toggle from '@/components/Common/Inputs/Toggle.vue'

import { useLayersStore } from "@/store/layers";
import { storeToRefs } from 'pinia';
const { showAdministrativeBoundaries } = storeToRefs(useLayersStore())

const Ownership = defineModel('Ownership')
const AdministrativeBoundaries = defineModel('AdministrativeBoundaries')


if (localStorage.getItem("administative-boundaries") === 'true') {
  AdministrativeBoundaries.value = true
}
if (localStorage.getItem("ownership-filter") === 'true') {
  Ownership.value = true
}


watch(Ownership, (value) => {
  console.log("Ownerschip", value)
})

watch(AdministrativeBoundaries, (value) => {
  showAdministrativeBoundaries.value = value === true
  localStorage.setItem("administative-boundaries", value === true ? 'true' : 'false')
})
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