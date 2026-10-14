<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import VueMarkdown from 'vue-markdown-render'
import Button from '@/components/Common/Buttons/Button.vue';
import OverlayModal from '@/components/Common/OverlayModal.vue';

import { useMapsetStore } from '@/store/mapsets'
import { storeToRefs } from 'pinia';

const { activeMapset } = storeToRefs( useMapsetStore() )

const isDisclaimerModalOpen = ref(false)

// 7 days
const expiresIn = 1000 * 60 * 60 * 24 * 7

/**
 * The disclaimer text from the mapset
 */
const disclaimerText = computed(
  () => {
    return (activeMapset.value?.consent) 
      ? activeMapset.value.consent
      : ''
  }
)

/**
 * Name of the disclaimer acceptance local storage property
 */
const disclaimerProperty = computed(
  () => {
    if (! activeMapset.value) return 'disclaimer'
    return `disclaimer-${activeMapset.value.id}`
  }
)

/**
 * Open the modal if there is a disclaimer attached to the mapset, and the user has not agreed to it within the last ExpiresIn period
 */
watch(
  () => activeMapset.value,
  (mapset) => {
    if (mapset && mapset.consent) {

      // Check for previously acceptation of disclaimer
      const acceptedAt = localStorage.getItem(disclaimerProperty.value)

      // Never accepted, or accepted longer than ExpiresIn ago? 
      if (! acceptedAt || (parseInt(acceptedAt) < (Date.now() - expiresIn))) {
        isDisclaimerModalOpen.value = true
      } else {
        isDisclaimerModalOpen.value = false
      }
    } else {
      isDisclaimerModalOpen.value = false
    }
  }
)

/**
 * Register acceptance of the disclaimer, and close the modal
 */
const handleAccept = function handleAccept() {
  localStorage.setItem(
    disclaimerProperty.value,
    `${Date.now()}`
  )

  isDisclaimerModalOpen.value = false
}
</script>

<template>
  <OverlayModal
    v-show="isDisclaimerModalOpen"
    :active="isDisclaimerModalOpen"
    variant="narrow"
    title="Disclaimer"
    :closeable="false">

    <VueMarkdown :source="disclaimerText" :options="{ breaks: true, html: false }" class="markdown" />

    <!-- When the text is too long for the dialog (a small phone) it scrolls
         under the button, which stays whole at the bottom; the white band
         covers the text beneath it. -mt-4 pt-4: where it fits, nothing moves. -->
    <div class="sticky bottom-0 -mt-4 bg-white pt-4">
      <Button
        @click.prevent="handleAccept"
        label="Akkoord" />
    </div>

  </OverlayModal>
</template>