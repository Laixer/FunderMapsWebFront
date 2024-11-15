<script setup lang="ts">
import { computed } from 'vue'; 
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BuildingIdHeader from '@/components/BuildingIdHeader.vue';
import BackLink from '../Common/Links/BackLink.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useAnalysisStore } from '@/store/building/analysis';
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useBuildingStore } from '@/store/buildings';

const { getAnalysisDataByBuildingId } = useAnalysisStore()
const { getLocationDataByBuildingId } = useGeoLocationsStore()
const { buildingId } = storeToRefs(useBuildingStore())

/**
 * Props & events
 */ 
const emit = defineEmits(['close', 'back'])

/**
 * Data source for panel
 */
const analysisData = computed(() => {
  if (! buildingId.value) return null
  return getAnalysisDataByBuildingId(buildingId.value)
})
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
  if (analysisData.value === null) return []

  const fieldsConfig = applyContextToFieldDataConfigs({
    source: analysisData,
    configs: [
      new FieldDataConfig({ name: 'externalId', source: locationData.value?.building }),
      new FieldDataConfig({ name: 'constructionYear' }),
      // BAG reliability
      new FieldDataConfig({ name: 'surfaceArea' }),
      // Volume
      new FieldDataConfig({ name: 'height' }),
      new FieldDataConfig({ name: 'groundWaterLevel' }),
      new FieldDataConfig({ name: 'groundLevel' }),
      new FieldDataConfig({ name: 'soil' }),
    ]
  })
  
  return fieldsConfig.map(retrieveAndFormatFieldData)
})

</script>

<template>
  <Panel 
    title="Pand" 
    icon="building"
    @close="emit('close')">

    <Transition>
      <BuildingIdHeader />
    </Transition>

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <div class="space-y-3">
        <h6 class="font-bold leading-none">Pand informatie</h6>
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