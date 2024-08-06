<script setup lang="ts">
import { watch } from 'vue';

import Toggle from '@/components/Common/Inputs/Toggle.vue'

const Ownership = defineModel('ownership')
const Borders = defineModel('borders')

watch(Ownership, (value) => {
  console.log("Ownerschip", value)
})
 
watch(Borders, (value) => {
  console.log("Borders", value)
})

</script>

<template>
  <div class="LayerToggleWrapper">
    <Toggle v-model="Ownership" label="Filter op eigendom" />
    <Toggle v-model="Borders" label="Administratieve grenzen" />
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