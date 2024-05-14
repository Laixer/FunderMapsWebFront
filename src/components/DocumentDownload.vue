<script setup lang="ts">
import { computed } from 'vue';
import { saveAs } from 'file-saver';

import { IDownloadLink } from '@/datastructures/interfaces';
import { getInquiryReportDownloadLink, getRecoveryReportDownloadLink } from '@/services/api/building';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';


const { sourceType, filename, id } = defineProps({
  id: { type: String, required: true },
  sourceType: { type: String, required: true, validator: (value: string) => ['incident', 'inquiry', 'recovery'].includes(value) },
  filename: { type: String, required: true },
  title: { type: String, default: 'Onderzoeksbestand' },
  label: { type: String, default: 'Download .pdf' }
})

/**
 * Get the callback associated with the source type
 */
const callback = computed<Function>(() => {
  switch(sourceType) {
    case 'incident':
      return getRecoveryReportDownloadLink
    case 'inquiry':
      return getInquiryReportDownloadLink
    case 'recovery':
      // TODO: No endpoint yet... 
      // TODO: Multiple files ?
      return () => {}
  }
  
  throw new Error("Unknown download source type")
})

const handleDownload = async function handleDownload() {
  const link: IDownloadLink = await callback.value(id) 
  
  if (link && link.accessLink) {
    saveAs(link.accessLink, filename)
  } else {
    console.log("Failed to retrieve download link")
  }
}

</script>

<template>
  <h6 v-if="title">{{ title }}</h6>
  <p>
    <a 
      class="link"
      @click.prevent="handleDownload">
      <FundermapsIcon
        name="file-pdf"
        class="aspect-square h-5"
        aria-hidden="true"
      />
      <strong>{{ label }}</strong>
    </a>
  </p>
</template>