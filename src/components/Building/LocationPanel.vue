<script setup lang="ts">
import { computed } from 'vue'; 
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '../Common/Links/BackLink.vue';

import MapIcon from '@assets/svg/icons/fundermaps/map.svg'

import { retrieveAndFormatFieldData, FieldDataConfig } from '@/utils/fieldData'

import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useBuildingStore } from '@/store/buildings';

const { getLocationDataByBuildingId } = useGeoLocationsStore()
const { buildingId } = storeToRefs(useBuildingStore())

/**
 * Props & events
 */ 
defineProps({ address: { type: String } })
const emit = defineEmits(['close', 'back'])

/**
 * Data source for panel
 */
const locationData = computed(() => {
  if (! buildingId.value) { 
    return null
  }

  return getLocationDataByBuildingId(buildingId.value)
})


/**
 * Link to a building in the PDOK viewer.
 */
const pdokLink = computed(() => {
  try {
    if (! buildingId.value) { 
      return null 
    }

    const objectId = buildingId.value.split('.').reverse()[0]
    if (objectId.length === 16 && /^\d+$/.test(objectId)) {
      return `https://bagviewer.kadaster.nl/lvbag/bag-viewer/?objectId=${objectId}`
    } 

    return null
  } catch(e) {
    return null
  }
})

/**
 * Append the external id to the value
 */
const appendExternalId = (value: string, config: FieldDataConfig) => {
  if (! value || value.length === 0) return value

  // @ts-ignore - 
  return `${value} (${config.source?.externalId})`
}

/**
 * Fields config
 */
const fieldsWithData = computed(() => {
  if (locationData.value === null) { 
    return [] 
  }

  const fieldsConfig = [
    new FieldDataConfig({ name: 'fullAddress', source: locationData.value?.address }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.neighborhood, formatter: appendExternalId }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.district, formatter: appendExternalId }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.municipality, formatter: appendExternalId }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.state, formatter: appendExternalId })
  ]
  return fieldsConfig.map(retrieveAndFormatFieldData)
})

</script>

<template>
  <Panel 
    title="Locatie" 
    icon="pin"
    :subtitle="address || ''"
    @close="emit('close')">

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
      :class="{ 'rounded-b-lg' : !! pdokLink }"
    >
      <div class="space-y-3">
        <h6 class="font-bold leading-none">Locatie informatie</h6>
        <dl class="space-y-3">
          <div 
            v-for="field in fieldsWithData" 
            :key="field.name">
            <dt>{{ field.label }}</dt>
            <dd class="text-grey-700">{{ field.value }}</dd>
          </div>
        </dl>
      </div>      
    </section>

    <template v-slot:footer v-if="pdokLink">  
      <a
        :href="pdokLink"
        class="link link--outline | group flex-1 justify-center px-2 py-0.5"
        target="_blank"
      >
        <MapIcon
          class="aspect-square w-3 group-hover:text-green-500"
          aria-hidden="true"
        />
        <strong>PDOK Viewer</strong>
      </a>
    </template>
  </Panel>
</template>

<style>
.rounded-b-lg {
  border-bottom-left-radius: .5rem;
  border-bottom-right-radius: .5rem;
}
</style>
