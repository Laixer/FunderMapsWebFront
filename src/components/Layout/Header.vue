<script setup lang="ts">
import { storeToRefs } from 'pinia';

import GrayLogo from '@/components/Branding/GrayLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
import SearchBar from '@/components/SearchBar.vue';

import { useMapsetStore } from '@/store/mapsets'
import OrgsMenu from '../OrgsMenu.vue';


const { hasAvailableMapsets } = storeToRefs( 
  useMapsetStore() 
)

</script>

<template>
  <header class="app-header isolate z-50 flex items-center gap-8 border-b border-grey-200 border-t-2 border-t-green-500 px-8 py-5">
    <GrayLogo />
    
    <Transition>
      <div v-if="hasAvailableMapsets" class="divider | w-[1px] flex-shrink-0 flex-grow-0 self-stretch bg-grey-400"></div>
    </Transition>

    <div class="flex w-full items-center gap-8">
      <Transition mode="out-in">
        <OrgsMenu v-if="hasAvailableMapsets" />
      </Transition>

      <Transition>
        <SearchBar v-if="hasAvailableMapsets" class="flex-1" />
      </Transition>

      <UserMenu />
    </div>

  </header>
</template>