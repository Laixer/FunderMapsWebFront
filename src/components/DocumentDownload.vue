<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { IDownloadLink } from '@/datastructures/interfaces';
import { getInquiryReportDownloadLink, getRecoveryReportDownloadLink } from '@/services/api/building';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';


const props = withDefaults(defineProps<{
  id: string | number
  sourceType: string
  filename: string
  title?: string
  label?: string
}>(), {
  title: 'Onderzoeksbestand',
  label: 'Download document',
})

// The last attempt to get the document failed: said under the button
const downloadFailed = ref(false)

// The message belongs to the document it was about
watch(() => props.id, () => { downloadFailed.value = false })

/**
 * Get the callback associated with the source type
 */
const callback = computed<(id: string) => Promise<IDownloadLink>>(() => {
  switch(props.sourceType) {
    case 'incident':
      return getRecoveryReportDownloadLink
    case 'inquiry':
      return getInquiryReportDownloadLink
    case 'recovery':
      // TODO: No endpoint yet...
      // TODO: Multiple files ?
      return () => Promise.resolve({ accessLink: '' } as IDownloadLink)
  }
  
  throw new Error("Unknown download source type")
})

const handleDownload = async function handleDownload() {
  downloadFailed.value = false

  try {
    const link: IDownloadLink = await callback.value(String(props.id))

    if (link && link.accessLink) {
      const a = document.createElement('a')
      a.href = link.accessLink
      a.download = props.filename
      a.click()
    } else {
      throw new Error("No download link in the answer")
    }
  } catch (e) {
    console.error("Failed to retrieve download link", e)
    downloadFailed.value = true
  }
}

</script>

<template>
  <h6 v-if="title">{{ title }}</h6>
  <p>
    <!-- A button: an <a> without href cannot be reached with the keyboard -->
    <button
      type="button"
      class="link"
      @click="handleDownload">
      <FundermapsIcon
        name="file-pdf"
        class="aspect-square h-5"
        aria-hidden="true"
      />
      <strong>{{ label }}</strong>
    </button>
  </p>
  <p v-if="downloadFailed" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
    Het downloaden van het document is niet gelukt. Probeer het later opnieuw.
  </p>
</template>