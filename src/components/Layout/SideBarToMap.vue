<script setup lang="ts">
import FundermapsIcon from '@/components/Common/Icons/FundermapsIcon.vue';
import CloseIcon from '@assets/svg/icons/close.svg'

import { usePhoneLayout } from './usePhoneLayout';

/**
 * The way back to the map from a side bar on a phone, where an open side bar
 *  covers the whole map. It closes the side bar exactly like the chevron in
 *  the panel's header does on a wide screen (the chevron itself is hidden on
 *  a phone: one control per thing).
 */
defineEmits<{ close: [] }>()

const isPhone = usePhoneLayout()
</script>

<template>
  <button
    v-if="isPhone"
    type="button"
    class="sidebar__to-map | absolute inset-x-0 top-0 z-20 flex h-12 items-center gap-2.5 border-b border-grey-200 bg-white px-7 text-left font-extrabold text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500"
    @click="$emit('close')"
  >
    <FundermapsIcon
      name="map"
      class="accent-color-blue aspect-square w-5 shrink-0"
      aria-hidden="true"
    />
    <span class="grow">Terug naar de kaart</span>
    <CloseIcon
      class="aspect-square h-3.5 shrink-0"
      aria-hidden="true"
    />
  </button>
</template>
