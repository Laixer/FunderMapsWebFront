<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

import PopoverModal from '@/components/Common/PopoverModal.vue';

import { useMainStore } from '@/store/main'
import { useBuildingStore } from '@/store/buildings';

const { isRemarkPopoverOpen, remarkPopoverTitle, remarkPopoverText } = storeToRefs( useMainStore() )

const { buildingId } = storeToRefs(useBuildingStore())

// If the id changes, no matter what it changes into, close the remarks popover
watch(
  () => buildingId.value,
  () => {
    handleClose()
  }
)

const handleClose = function handleClose() {
  isRemarkPopoverOpen.value = false
}

</script>

<template>
  <PopoverModal
    class="RemarkPopover"
    v-if="isRemarkPopoverOpen && remarkPopoverTitle && remarkPopoverText"
    :title="remarkPopoverTitle" 
    :text="remarkPopoverText"
    placing="end"
    @close="handleClose" />
</template>

<style>
.RemarkPopover {
  position: absolute;
  right: 336px;
  bottom: 0;
}
</style>