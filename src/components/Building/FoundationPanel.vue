<script setup lang="ts">
import { computed } from 'vue'; 
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '../Common/Links/BackLink.vue';

import FoundationIcon from '../Common/Icons/FoundationIcon.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useAnalysisStore } from '@/store/building/analysis';
import { useBuildingStore } from '@/store/buildings';

const { getAnalysisDataByBuildingId } = useAnalysisStore()
const { buildingId } = storeToRefs(useBuildingStore())

/**
 * Props & events
 */ 
defineProps({ address: { type: String } })
const emit = defineEmits(['close', 'back'])

/**
 * Data source for panel
 */
const analysisData = computed(() => {
  if (! buildingId.value) return null
  return getAnalysisDataByBuildingId(buildingId.value)
})

/**
 * Foundation label
 *  TODO: Foundation icon slug
 */
const foundationType = computed(() => {
  return retrieveAndFormatFieldData(
    new FieldDataConfig({
      name: 'foundationType',
      source: analysisData
    })
  )
})

const foundationIconName = computed(() => {
  if (! analysisData.value) return null

  switch(analysisData.value?.foundationType) {
    case 0:
    case 1:
    case 2:
    case 15:
    case 16:
    case 17:
      return 'houten-palen'

    case 3:
    case 11:
    case 12:
    case 13:
      return 'betonnen-palen'

    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      return 'niet-onderheid'
    
    case 10:
      return 'houten-palen-oplanger'

    default:
      return null
  }
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
      new FieldDataConfig({ name: 'foundationTypeReliability' }),
      new FieldDataConfig({ name: 'restorationCosts' }),
      new FieldDataConfig({ name: 'velocity' }),
      new FieldDataConfig({ name: 'recoveryType' })
    ]
  })
  
  return fieldsConfig.map(retrieveAndFormatFieldData)
})

</script>

<template>
  <Panel 
    title="Fundering" 
    icon="file-foundation"
    :subtitle="address || ''"
    @close="emit('close')">

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <div class="space-y-3">
        <h6 class="font-bold leading-none">Fundering</h6>
        <div class="foundation | accent-color-green">
          <FoundationIcon 
            v-if="foundationIconName"
            :name="foundationIconName" 
            class="aspect-square w-20"
            aria-hidden="true" />
          <div class="foundation__label">{{ foundationType.value }}</div>
        </div>
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