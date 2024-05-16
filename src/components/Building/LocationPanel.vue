<script setup lang="ts">
import { computed } from 'vue'; 
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '../Common/Links/BackLink.vue';

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
  if (! buildingId.value) return null
  return getLocationDataByBuildingId(buildingId.value)
})


/**
 * Fields config
 *  TODO: formatter based on 'prefix', 'suffix', 'decimal'
 *  TODO: formatter based on central config, like field labels
 */
const fieldsWithData = computed(() => {
  if (locationData.value === null) return []

  const fieldsConfig = [
    new FieldDataConfig({ name: 'fullAddress', source: locationData.value?.address }),
    new FieldDataConfig({ name: 'postalCode', source: locationData.value?.address }),
    new FieldDataConfig({ name: 'buildingNumber', source: locationData.value?.address }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.neighborhood }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.district }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.municipality }),
    new FieldDataConfig({ name: 'name', source: locationData.value?.state })
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
  </Panel>
</template>