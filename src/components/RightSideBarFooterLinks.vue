<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { saveAs } from 'file-saver'

import { incidentLink, feedbackLink } from '@/config'

import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';


import AlertIcon from '@assets/svg/icons/alert.svg'
import ChatIcon from '@assets/svg/icons/chat.svg'

import { useBuildingStore } from '@/store/buildings';

import { getPdf } from '@/services/api/pdf'

const { buildingId } = storeToRefs(useBuildingStore())

const feedbackLinkWithId = computed<string>(() => {
  return buildingId.value 
    ? `${feedbackLink}${buildingId.value}`
    : `${feedbackLink}`
})

const isDownloading = ref(false)

const handleDownload = async function handleDownload() {
  if (buildingId.value && ! isDownloading.value) {
    isDownloading.value = true 

    // Ensure the appropiate filename is used even if the user navigates away while the download is still being processed
    const filename = buildingId.value + '' 

    const response = await getPdf(filename)

    // Chrome, FF, Edge
    // @ts-ignore
    if (window.browser && window.browser.downloads) {
      // @ts-ignore
      window.browser.downloads.download({
        url: response,
        filename: `${filename}.pdf`
      })
    } else { // Safari, etc.
      const res = await fetch(response)
      const blob = await res.blob()
      saveAs(blob, `${filename}.pdf`)
    }

    isDownloading.value = false 
  }
}


</script>

<template>
  <div class="flex flex-col w-100 gap-2" style="width: 100%">
    <Transition>
      <div
        v-if="isDownloading"
        class="link link--outline disabled | group flex-1 justify-center px-2 py-0.5"
      >
        <FundermapsIcon
          name="file-pdf"
          class="aspect-square w-3"
          aria-hidden="true"
        />
        <strong>PDF wordt aangemaakt<span class="dots">...</span></strong>
      </div>
    </Transition>
    <div
      v-if="buildingId && ! isDownloading"
      @click="handleDownload"
      class="link link--outline | group flex-1 justify-center px-2 py-0.5"
    >
      <FundermapsIcon
        name="file-pdf"
        class="aspect-square w-3 group-hover:text-green-500"
        aria-hidden="true"
      />
      <strong>PDF downloaden</strong>
    </div>
    <div 
      class="flex gap-2" 
      :class="{ 'flex-col': ! buildingId }" 
      style="width: 100%">
      <a
        :href="incidentLink"
        class="link link--outline | group flex-1 justify-center px-2 py-0.5"
        target="_blank"
      >
        <AlertIcon
          class="aspect-square w-3 group-hover:text-green-500"
          aria-hidden="true"
        />
        <strong>Incident</strong>
      </a>
      <a
        :href="feedbackLinkWithId"
        class="link link--outline | group flex-grow justify-center px-2 py-0.5"
        target="_blank"
      >
        <ChatIcon
          class="aspect-square w-3 group-hover:text-green-500"
          aria-hidden="true"
        />
        <strong>Feedback</strong>
      </a>
    </div>
  </div>
</template>

<style>

@keyframes dots {
    0% { background-position: 0px; }
    100% { background-position: 15px; }
}

.dots {
    background: linear-gradient(to right, rgb(232 234 241 / var(--tw-border-opacity)) 50%, black 50%);
    color: transparent;
    -webkit-background-clip: text;
    -webkit-animation: dots 1.2s infinite steps(4);
    padding-right: 40px;
    margin-right: -40px;
}

</style>