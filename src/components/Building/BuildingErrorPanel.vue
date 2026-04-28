<script setup lang="ts">
import Panel from '@/components/Common/Panel.vue'
import AlertIcon from '@assets/svg/icons/alert.svg'

defineEmits<{ close: [] }>()
</script>

<template>
  <Panel title="Pand Informatie" @close="$emit('close')">
    <div class="flex flex-col items-center gap-4 py-8 text-center">
      <AlertIcon class="w-12 text-grey-400" aria-hidden="true" />
      <div class="space-y-1">
        <h5 class="heading-5 text-grey-700">Geen data beschikbaar</h5>
        <p class="text-sm text-grey-400">
          De informatie over dit pand kon niet geladen worden. Selecteer een ander pand op de kaart.
        </p>
      </div>
    </div>
  </Panel>
</template>
