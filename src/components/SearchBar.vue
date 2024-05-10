<script setup lang="ts">
import { type Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import mapboxgl from 'mapbox-gl';

import { debouncedRef } from '@vueuse/core';
import { vOnClickOutside } from '@vueuse/components'

import Input from '@/components/Common/Inputs/Input.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue';
import IconButton from '@/components/Common/Buttons/IconButton.vue';
import SearchIcon from '@assets/svg/icons/search.svg'
import FundermapsIcon from './Common/Icons/FundermapsIcon.vue';

import { getSuggestions, getLookup, getSuggestionsNearCoordinates } from '@/services/pdok'
import { IPDOKSuggestion } from '@/datastructures/interfaces';

import { useMainStore } from '@/store/main';
import { useBuildingRouting } from '@/router/buildingRouting'

const { mapCenterLatLon } = storeToRefs( useMainStore() )

const buildingRouting = useBuildingRouting()

const queryString = ref('')

// Debounce the query string to avoid spamming PDOK when holding key down
const debouncedQueryString = debouncedRef(queryString, 50, { maxWait: 150 } )

// Results from the suggestion query
const lastQuery: Ref<string> = ref('')
const suggestions: Ref<IPDOKSuggestion[]> = ref([])
const focusedSuggestion: Ref<number|null> = ref(null)

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
 * Any change in the typed value directly resets the selection, without delay
 */
watch(
  () => queryString.value,
  () => focusedSuggestion.value = null
)

/**
 * Look up suggestions when focusing back on the input field
 */
const handleFocus = async function handleFocus() {
  await handleGetSuggestions(debouncedQueryString.value)
}

/**
 * Change suggestion focus & selection through ArrowUp, ArrowDown & Enter keys
 *  while focussing on the search input field
 */
const handleKeyDown = async function handleKeyDown(event: KeyboardEvent) {
  
  // Navigate with up and down keys
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()

    // Start navigation
    if (focusedSuggestion.value === null && event.key === 'ArrowDown') {
      focusedSuggestion.value = 0
    }
    // End navigation
    else if (focusedSuggestion.value === 0 && event.key === 'ArrowUp') {
      focusedSuggestion.value = null
    }

    // Up & down
    else if (focusedSuggestion.value !== null) {

      // Detect whether we're at or past the end of the list
      if ((focusedSuggestion.value + 1) >= suggestions.value.length) {
        // Set to last item (override any possible issues where index exceeded length)
        focusedSuggestion.value = suggestions.value.length - 1

        // Ignore down when already at the last item
        if (event.key === 'ArrowDown') return
      }

      if (event.key === 'ArrowDown') {
        focusedSuggestion.value = focusedSuggestion.value + 1
      } else {
        focusedSuggestion.value = focusedSuggestion.value - 1
      }
    }
  }

  // Select through Enter key
  else if (focusedSuggestion.value !== null && event.key === 'Enter') {
    event.preventDefault()
    await handleSelectBuilding(
      suggestions.value[focusedSuggestion.value].id,
      suggestions.value[focusedSuggestion.value].weergavenaam
    )
  }
  else if (event.key === 'Escape') {
    handleClose()
    focusedSuggestion.value = null
  }
}

/**
 * When hovering over a list item in de suggestions list, mark it as the focused suggestion
 */ 
const onHover = function onHover(index: number) {
  focusedSuggestion.value = index
}

/**
 * Handle getting the suggestions from PDOK
 */
const handleGetSuggestions = async function handleGetSuggestions(query: string){
  try {
    // Remove the emptiness
    query = query.trim()

    // Nothing to search for
    if (query === '') return 

    // Do not repeat the same query
    if (query === lastQuery.value) return 
    lastQuery.value = query

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

  } catch(e) {
    console.log(e)
    error.value = true
  }
}


/**
 * The user has selected an address to view
 */
const handleSelectBuilding = async function handleSelectBuilding(id: string, weergavenaam: string) {
  try {
    const results = await getLookup(id)

    if (! Array.isArray(results?.response?.docs) || results.response.docs.length === 0) {
      console.log("Lookup call failed", id, weergavenaam)
      throw new Error("Lookup call failed to produce results")
    }

    const { centroide_ll, nummeraanduiding_id } = results.response.docs[0]

    /**
     * Navigating to the lat lng while the API calls are being made
     *  The lat lng from the API may differ, but that should not be a big enough difference to matter here
     */ 
    const [ Lng, Lat ] = centroide_ll.replace('POINT(', '').replace(')', '').split(' ')
    mapCenterLatLon.value = new mapboxgl.LngLat(Lng, Lat)
    
    // Insert the selected address in the search box, and close the suggestion list
    lastQuery.value = weergavenaam // this prevents a Lookup API call to PDOK
    queryString.value = weergavenaam
    handleClose()

    // Navigate to the building, which triggers loading the data, opening the sidebar and placing the marker
    if (nummeraanduiding_id) {
      buildingRouting.navigateToBuilding(nummeraanduiding_id)
    }

  } catch(e) {
    console.log(e)
    error.value = true
  }
}

// What more can we do? 
const handleSubmit = function handleSubmit() {
  handleClose()

  // TODO: Search with API first, then PDOK.
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

    <form 
      class="search-bar | flex gap-2"
      @submit.prevent="handleSubmit">

      <Input 
        v-model="queryString"
        id="search" 
        placeholder="Zoek hier op adres of postcode"
        autocomplete="off"
        @focus="handleFocus"
        @keydown="handleKeyDown"
        >
        <template v-slot:after>
          <IconButton class="text-blue-900 hover:text-green-700" transparent label="Zoeken">
            <SearchIcon 
              class="aspect-square w-4"
              aria-hidden="true" />
          </IconButton>
        </template>
      </Input>

    </form>

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
              <li 
                v-for="(suggestion, index) in suggestions" :key="suggestion.id"
                @mouseover="onHover(index)">
                <a
                  href="#"
                  class="flex gap-3 px-8 py-2"
                  :class="index === focusedSuggestion ? 'bg-grey-100 text-green-500' : ''"
                  @click.prevent="handleSelectBuilding(suggestion.id, suggestion.weergavenaam)"
                >
                  <div class="flex gap-2">
                    <span class="text-green-500"> 
                      <FundermapsIcon
                        name="pin"
                        class="aspect-square w-4"
                        aria-hidden="true" 
                      />
                    </span>
                    <h6 class="heading-6 leading-none">{{ suggestion.weergavenaam }}</h6>
                  </div>
                </a>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>