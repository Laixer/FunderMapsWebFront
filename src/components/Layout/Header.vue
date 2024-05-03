<script setup lang="ts">
import { storeToRefs } from 'pinia';

import GrayLogo from '@/components/Branding/GrayLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
import SearchBar from '@/components/SearchBar.vue';
// import MapsetMenu from '@/components/MapsetMenu.vue';

import { useMapsetStore } from '@/store/mapsets'
import OrgsMenu from '../OrgsMenu.vue';
// import { useOrgsStore } from '@/store/orgs';


const { hasAvailableMapsets } = storeToRefs( 
  useMapsetStore() 
)

</script>

<template>
  <header class="app-header isolate z-50 flex items-center gap-8 px-8 py-5">
    <GrayLogo />
    
    <Transition>
      <div v-if="hasAvailableMapsets" class="divider | w-[1px] flex-shrink-0 flex-grow-0 self-stretch bg-grey-400"></div>
    </Transition>

    <div class="flex flex-row-reverse w-full items-center justify-between gap-8">
      <UserMenu />

      <Transition>
        <SearchBar v-if="hasAvailableMapsets" />
      </Transition>
      
      <Transition mode="out-in">
        <OrgsMenu v-if="hasAvailableMapsets" />
      </Transition>
    </div>

  </header>
</template>