<script setup lang="ts">
import { type Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { debouncedRef } from '@vueuse/core';
import { vOnClickOutside } from '@vueuse/components'


import Input from '@/components/Common/Inputs/Input.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue';
import IconButton from '@/components/Common/Buttons/IconButton.vue';
import SearchIcon from '@assets/svg/icons/search.svg'

import { getSuggestions, getLookup, getSuggestionsNearCoordinates } from '@/services/pdok'
import { IPDOKSuggestion } from '@/datastructures/interfaces';

import { useMainStore } from '@/store/main';
import FundermapsIcon from './Common/Icons/FundermapsIcon.vue';
import mapboxgl from 'mapbox-gl';
const { mapCenterLatLon } = storeToRefs( useMainStore() )


const queryString = ref('')

// Debounce the query string to avoid spamming PDOK when holding key down
const debouncedQueryString = debouncedRef(queryString, 50, { maxWait: 150 } )

// Results from the suggestion query
const suggestions: Ref<IPDOKSuggestion[]> = ref([])

// TODO: Show a no results / error message ?
const noResults = ref(false)
const error = ref(false)

/**
 * Watch changes to the query from the input box,
 *  with a debounce of 200 ms
 */
watch(
  () => debouncedQueryString.value,
  async (value: string) => await handleGetSuggestions(value)
)

/**
 * Look up suggestions when focusing back on the input field
 */
const handleFocus = async function handleFocus() {
  await handleGetSuggestions(debouncedQueryString.value)
}

/**
 * Handle getting the suggestions from PDOK
 */
const handleGetSuggestions = async function handleGetSuggestions(query: string){
  try {
    // remove the emptiness
    query = query.trim()

    // Nothing to search for
    if (query === '') return 

    let results
    if (mapCenterLatLon.value) {
      results = await getSuggestionsNearCoordinates(
        query, 
        mapCenterLatLon.value.lat, 
        mapCenterLatLon.value.lng,
        5
      )
    } else {
      results = await getSuggestions(query, 5)
    }
    
    if (! results) {
      noResults.value = true
      suggestions.value = []
      return
    }

    noResults.value = false
    suggestions.value = results.response.docs as IPDOKSuggestion[]
    
    console.log(results)

  } catch(e) {
    console.log(e)
    error.value = true
  }
}


/**
 * The user has selected an address to view
 */
const handleSelectBuilding = async function handleSelectBuilding(id: string) {
  try {
    // console.log(id)

    const results = await getLookup(id)
    console.log(results.response.docs[0])

    const { centroide_ll } = results.response.docs[0] // , weergavenaam

    console.log(id, centroide_ll) // , weergavenaam
    const [ Lng, Lat ] = centroide_ll.replace('POINT(', '').replace(')', '').split(' ')

    
    mapCenterLatLon.value = new mapboxgl.LngLat(Lng, Lat)
    
    // TODO: drop pin on map
    // TODO: open building info in right sidebar

  } catch(e) {
    console.log(e)
    error.value = true
  }
}

const handleClose = function handleClose() {
  suggestions.value = []
  noResults.value = false
  error.value = false
}
</script>

<template>
  <div 
    v-on-click-outside="handleClose"
    class="relative">

    <div class="search-bar | flex gap-2">

      <Input 
        v-model="queryString"
        id="search" 
        placeholder="Zoek hier op adres of postcode"
        @focus="handleFocus">
        <template v-slot:after>
          <IconButton class="text-blue-900 hover:text-green-700" transparent label="Zoeken">
            <SearchIcon 
              class="aspect-square w-4"
              aria-hidden="true" />
          </IconButton>
        </template>
      </Input>

    </div>

    <Transition>
      <div
        v-if="suggestions.length"
        class="dropdown arrow arrow--top-left | absolute -left-7 top-full origin-top-left outline-none"
      >
        <div
          class="dropdown__main | relative grid rounded-lg bg-white py-4 shadow-float"
        >
          <div
            class="dropdown__header | flex items-baseline justify-between gap-6 px-8 pb-2 pt-3"
          >
            <h3 class="heading-5 whitespace-nowrap">Suggesties</h3>
            <CloseBtn 
              class="-translate-y-3 translate-x-3 p-0"
              @close="handleClose" />
          </div>
          <div class="dropdown__content">
            <ol>
              <li v-for="suggestion in suggestions" :key="suggestion.id">
                <a
                  href="#"
                  class="flex gap-3 px-8 py-2 hover:bg-grey-100"
                  @click.prevent="handleSelectBuilding(suggestion.id)"
                >
                  <div>
                    <h6 class="heading-6 leading-none">{{ suggestion.weergavenaam }}</h6>
                    <div 
                      class="flex gap-2 text-sm text-green-500">
                      <FundermapsIcon
                        name="pin"
                        class="aspect-square w-4"
                        aria-hidden="true" 
                      />
                      Ga naar deze locatie
                    </div>
                  </div>
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>@/datastructures/interfaces@/services/dpok