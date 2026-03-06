<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';

import { useBuildingStore } from '@/store/buildings';
import { getPdf } from '@/services/api/pdf'

const { buildingId } = storeToRefs(useBuildingStore())

const isDownloading = ref(false)

const handleDownload = async function handleDownload() {
  if (buildingId.value && ! isDownloading.value) {
    isDownloading.value = true

    // Ensure the appropriate filename is used even if the user navigates away while the download is still being processed
    const filename = buildingId.value + ''

    const response = await getPdf(filename)

    const res = await fetch(response)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.pdf`
    a.click()
    URL.revokeObjectURL(url)

    isDownloading.value = false
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
  </div>
</template>
