<script setup lang="ts">
import { computed } from 'vue';

import { IDownloadLink } from '@/datastructures/interfaces';
import { getInquiryReportDownloadLink, getRecoveryReportDownloadLink } from '@/services/api/building';
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';


const props = defineProps({
  id: { type: [String,Number], required: true },
  sourceType: { type: String, required: true, validator: (value: string) => ['incident', 'inquiry', 'recovery'].includes(value) },
  filename: { type: String, required: true },
  title: { type: String, default: 'Onderzoeksbestand' },
  label: { type: String, default: 'Download .pdf' }
})

/**
 * Get the callback associated with the source type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callback = computed<(id: any) => Promise<IDownloadLink>>(() => {
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
  const link: IDownloadLink = await callback.value(props.id) 
  
  if (link && link.accessLink) {
    const a = document.createElement('a')
    a.href = link.accessLink
    a.download = props.filename
    a.click()
  } else {
    console.error("Failed to retrieve download link")
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