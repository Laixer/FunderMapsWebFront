<script setup lang="ts">

import { incidentLink, feedbackLink } from '@/config'

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import AlertIcon from '@assets/svg/icons/alert.svg'
import ChatIcon from '@assets/svg/icons/chat.svg'

import { useBuildingStore } from '@/store/buildings';

const { buildingId } = storeToRefs(useBuildingStore())

const feedbackLinkWithId = computed<string>(() => {
  return buildingId.value 
    ? `${feedbackLink}${buildingId.value}`
    : `${feedbackLink}`
})
</script>

<template>
  <div class="flex flex-col w-100 gap-2" style="width: 100%">
    <!-- <a
      href=""
      class="link link--outline | group flex-1 justify-center px-2 py-0.5"
    >
      <FundermapsIcon
        name="file-pdf"
        class="aspect-square w-3 group-hover:text-green-500"
        aria-hidden="true"
      />
      <strong>PDF downloaden</strong>
    </a>
    -->
    <div class="flex gap-2" style="width: 100%">
      <a
        :href="incidentLink"
        class="link link--outline | group flex-1 justify-center px-2 py-0.5"
        target="_blank"
      >
        <AlertIcon
          class="aspect-square w-3 group-hover:text-green-500"
          aria-hidden="true"
        />
        <strong>Incident melden</strong>
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