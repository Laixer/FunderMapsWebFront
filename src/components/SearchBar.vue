<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import mapboxgl from 'mapbox-gl';

import { debouncedRef } from '@vueuse/core';
import { vOnClickOutside } from '@vueuse/components'

import Input from '@/components/Common/Inputs/Input.vue'
import CloseBtn from '@/components/Common/Buttons/CloseBtn.vue';
import IconButton from '@/components/Common/Buttons/IconButton.vue';
import SearchIcon from '@assets/svg/icons/search.svg'
import CloseIcon from '@assets/svg/icons/close.svg'
import FundermapsIcon from './Common/Icons/FundermapsIcon.vue';

import { getSuggestions, getLookup, getSuggestionsNearCoordinates } from '@/services/pdok'
import { IPDOKSuggestion } from '@/datastructures/interfaces';

import { useMainStore } from '@/store/main';
import { useSessionStore } from '@/store/session';
import { useBuildingRouting } from '@/router/buildingRouting'
import { getLocationInformationByBuildingId } from '@/services/api/building';

const { mapCenterLatLon, mapMarkerLatLon } = storeToRefs(useMainStore())
const { isAuthenticated } = storeToRefs(useSessionStore())

const buildingRouting = useBuildingRouting()

const queryString = ref('')

// Debounce the query string to avoid spamming PDOK when holding key down
const debouncedQueryString = debouncedRef(queryString, 10, { maxWait: 150 } )

// Results from the suggestion query
const lastQuery = ref('')
const suggestions = ref<IPDOKSuggestion[]>([])
const focusedSuggestion = ref<number | null>(null)

// TODO: Show a no results / error message ?
const noResults = ref(false)
const error = ref(false)

/**
 * Watch changes to the query from the input box,
 *  with a debounce of 200 ms
 */
watch(
  () => debouncedQueryString.value,
  async (value: string) => {

    value = value.trim()

    // No repeat please
    if (value === lastQuery.value) return

    // TODO: We have more tests to do here
    // Directly open a known buildingId
    if (
      (value.length === 16 && /^[0-9]+$/.test(value)) ||
      (value.includes('BAG') || value.includes('bag'))
    ) {
      const buildingIdVerified = await verifyBuildingId(value)
      if (buildingIdVerified) {
        buildingRouting.navigateToBuilding(value)
        return
      }
    }
    
    await handleGetSuggestions(value)

    // no results and query string longer than 10 characters? Let's give the Fundermaps API a try
    if (suggestions.value.length === 0 && value.length > 10) {
      const buildingIdVerified = await verifyBuildingId(value)
      if (buildingIdVerified) {
        buildingRouting.navigateToBuilding(value)
        return
      }
    }
  }
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
 * Get the building Id from Fundermaps API
 */
const verifyBuildingId = async function verifyBuildingId(id: string) {
  try {
    if (! isAuthenticated.value) return false

    await getLocationInformationByBuildingId(id)
    return true
  } catch {
    return false
  }
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
        10
      )
    } else {
      results = await getSuggestions(query, 10)
    }
    
    if (! results) {
      noResults.value = true
      suggestions.value = []
      return
    }

    noResults.value = false
    suggestions.value = results.response.docs as IPDOKSuggestion[]

  } catch {
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
      console.warn("Lookup call failed", id, weergavenaam)
      throw new Error("Lookup call failed to produce results")
    }

    const { centroide_ll, nummeraanduiding_id } = results.response.docs[0]

    // Insert the selected address in the search box, and close the suggestion list
    lastQuery.value = weergavenaam // this prevents a Lookup API call to PDOK
    queryString.value = weergavenaam
    handleClose()

    // Always pan + drop a marker at the PDOK coords — the geocoder API
    // doesn't return building coordinates, so this is the only source of
    // truth for the selection's location.
    const [ Lng, Lat ] = (centroide_ll ?? '').replace('POINT(', '').replace(')', '').split(' ')
    const lngLat = new mapboxgl.LngLat(parseFloat(Lng), parseFloat(Lat))
    mapMarkerLatLon.value = lngLat

    // Await navigation so the URL writeback in mapCenterRouting (triggered
    // by mapCenterLatLon below) sees the new route — otherwise it pushes
    // the old route and cancels this navigation.
    if (nummeraanduiding_id && isAuthenticated.value) {
      await buildingRouting.navigateToBuilding(nummeraanduiding_id)
    }
    mapCenterLatLon.value = lngLat

  } catch {
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

const handleClear = function handleClear() {
  queryString.value = ''
  lastQuery.value = ''
  handleClose()
}
</script>

<template>
  <div 
    v-on-click-outside="handleClose"
    class="relative grow">

    <form 
      class="flex gap-2"
      @submit.prevent="handleSubmit">

      <Input
        v-model="queryString"
        id="search"
        class="grow [&_.input-field]:w-auto"
        placeholder="Zoek hier op adres of postcode"
        autocomplete="off"
        role="combobox"
        :aria-expanded="suggestions.length > 0"
        aria-controls="search-suggestions"
        :aria-activedescendant="focusedSuggestion !== null ? `suggestion-${focusedSuggestion}` : undefined"
        @focus="handleFocus"
        @keydown="handleKeyDown"
        >
        <template v-slot:after>
          <IconButton
            v-if="queryString"
            class="text-grey-400 hover:text-red-500"
            transparent
            label="Wissen"
            @click.prevent="handleClear">
            <CloseIcon
              class="aspect-square w-3"
              aria-hidden="true" />
          </IconButton>
          <IconButton
            v-else
            class="text-blue-900 hover:text-green-700"
            transparent
            label="Zoeken">
            <SearchIcon
              class="aspect-square w-4"
              aria-hidden="true" />
          </IconButton>
        </template>
      </Input>

    </form>

    <Transition name="slide-down">
      <div
        v-if="suggestions.length"
        class="search-dropdown dropdown arrow arrow--top-left | absolute -left-7 top-full w-[28rem] origin-top-left outline-none"
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
            <ol id="search-suggestions" role="listbox" aria-label="Adres suggesties">
              <li
                v-for="(suggestion, index) in suggestions" :key="suggestion.id"
                :id="`suggestion-${index}`"
                role="option"
                :aria-selected="index === focusedSuggestion"
                @mouseover="onHover(index)">
                <a
                  href="#"
                  tabindex="-1"
                  class="flex cursor-pointer gap-3 px-8 py-2 transition-colors duration-100"
                  :class="index === focusedSuggestion ? 'bg-grey-100 text-green-500' : ''"
                  @click.prevent="handleSelectBuilding(suggestion.id, suggestion.weergavenaam)"
                >
                  <div class="flex gap-2">
                    <span class="text-green-500 inline-block w-4">
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
