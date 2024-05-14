<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

import PopoverModal from '@/components/Common/PopoverModal.vue';

import { useMainStore } from '@/store/main'
import { useMapsetStore } from '@/store/mapsets';

const { isInfoPopoverOpen, isLeftSidebarOpen, isShowingMapsetSelection } = storeToRefs( useMainStore() )
const { activeMapset } = storeToRefs( useMapsetStore() )

watch(
  () => isLeftSidebarOpen.value,
  (isOpen) => {
    // Also close the popover if the sidebar is closed
    if (! isOpen) handleClose()
  }
)

watch(
  () => isShowingMapsetSelection.value,
  (value) => {
    // If showing the mapset selection list, close the popover
    if (value) handleClose()
  }
)

const handleClose = function handleClose() {
  isInfoPopoverOpen.value = false
}
</script>

<template>
  <PopoverModal   
    v-if="isInfoPopoverOpen && activeMapset && activeMapset.note"
    :title="activeMapset.name" 
    :text="activeMapset.note"
    @close="handleClose" />
</template>