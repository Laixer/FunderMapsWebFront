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
    placing="start"
    @close="handleClose" />
</template>

<style scoped>
/* Beside the right side bar, from the top of the map (under the 5rem header).
   It ends above the map's buttons, which are in the bottom right corner and
   were under the popover; a remark that needs more height scrolls inside.
   On a phone the popover is a sheet from the bottom (pages/dashboard.css). */
.RemarkPopover {
  position: absolute;
  right: var(--sidebar-width);
  top: 5rem;
  bottom: 14rem;

  /* As high as the remark, from the top. Said here: the class Modal makes of
     `placing` exists in the stylesheet for "center" only. */
  align-items: start;
}
</style>