<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';

import { useBuildingStore } from '@/store/buildings';
import { getPdf } from '@/services/api/pdf'

const { buildingId } = storeToRefs(useBuildingStore())

const isDownloading = ref(false)

// The last attempt to make the PDF failed: said under the button
const downloadFailed = ref(false)

// The message belongs to the pand it was about
watch(buildingId, () => { downloadFailed.value = false })

const handleDownload = async function handleDownload() {
  if (buildingId.value && ! isDownloading.value) {
    isDownloading.value = true
    downloadFailed.value = false

    // Ensure the appropriate filename is used even if the user navigates away while the download is still being processed
    const filename = buildingId.value + ''

    try {
      const url = await getPdf(filename)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to make the PDF', e)
      downloadFailed.value = true
    } finally {
      isDownloading.value = false
    }
  }
}

</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <OutlineButton
      v-if="buildingId"
      :label="isDownloading ? 'PDF wordt aangemaakt...' : 'PDF downloaden'"
      :disabled="isDownloading"
      class="w-full"
      @click="handleDownload"
    >
      <template v-slot:before>
        <FundermapsIcon
          name="file-pdf"
          class="aspect-square w-4"
          aria-hidden="true"
        />
      </template>
    </OutlineButton>
    <p v-if="downloadFailed" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
      Het maken van de PDF is niet gelukt. Probeer het later opnieuw.
    </p>
  </div>
</template>
