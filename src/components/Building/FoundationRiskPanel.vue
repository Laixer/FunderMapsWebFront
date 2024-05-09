<script setup lang="ts">
import { ComputedRef, computed } from 'vue'; 
import { storeToRefs } from 'pinia';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '../Common/Links/BackLink.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs, CompletedFieldData } from '@/utils/fieldData'

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

const fieldGroupHeaders: Record<string, string> = {
  drystand: 'Droogstand',
  dewatering: 'Ontwateringsdiepte',
  bioinfection: 'Bacterieelaantasting',
  negativecling: 'Negatievekleef',
  differentialsettlement: 'Verschilzakking',
  unclassified: 'Op basis van onderzoek',
  facadescan: 'GevelScan Risico',
}

/**
 * Fields config
 */
const fieldsConfig = applyContextToFieldDataConfigs({
  source: analysisData,
  configs: [
    new FieldDataConfig({ group: 'drystand', name: 'drystandRisk' }),
    new FieldDataConfig({ group: 'drystand', name: 'drystand' }),
    new FieldDataConfig({ group: 'drystand', name: 'drystandReliability' }),
    new FieldDataConfig({ group: 'dewatering', name: 'dewateringDepthRisk' }),
    new FieldDataConfig({ group: 'dewatering', name: 'dewateringDepth' }),
    new FieldDataConfig({ group: 'dewatering', name: 'dewateringDepthReliability' }),
    new FieldDataConfig({ group: 'bioinfection', name: 'bioInfectionRisk' }),
    new FieldDataConfig({ group: 'bioinfection', name: 'bioInfectionReliability' }),
    new FieldDataConfig({ group: 'negativecling', name: 'negativeclingRisk' }),
    new FieldDataConfig({ group: 'negativecling', name: 'negativeclingReliability' }),
    new FieldDataConfig({ group: 'differentialsettlement', name: 'differentialsettlementRisk' }),
    new FieldDataConfig({ group: 'differentialsettlement', name: 'differentialsettlementReliability' }),
    new FieldDataConfig({ group: 'unclassified', name: 'unclassifiedRisk' }),
    new FieldDataConfig({ group: 'facadescan', name: 'facadescanRisk' }),
  ]
})

const fieldsWithData: ComputedRef<Record<string, CompletedFieldData[]>> = computed(() => {
  if (analysisData.value === null) return {}
  return fieldsConfig
    .map(retrieveAndFormatFieldData)
    .reduce(
      (acc: Record<string, CompletedFieldData[]>, fieldData: CompletedFieldData) => {

        const group = fieldData?.group || ''
        if (group) {
          acc[group] = acc[group] || []
          acc[group].push(fieldData)
        }

        return acc
      }, {} as Record<string, CompletedFieldData[]>
    )
})

</script>

<template>
  <Panel 
    title="Funderingsrisico" 
    :subtitle="address || ''"
    @close="emit('close')"
    class="FoundationRiskPanel">

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <template v-for="group in Object.keys(fieldGroupHeaders)">
        <div 
          v-if="fieldsWithData[group]"
          class="space-y-3">
          <h6 class="font-bold leading-none">{{ fieldGroupHeaders[group] }}</h6>
          <dl class="space-y-3">
            <div 
              v-for="field in fieldsWithData[group]" 
              :key="field.name">
              <dt>{{ field.label }}</dt>
              <dd class="text-grey-700">{{ field.value }}</dd>
            </div>
          </dl>
        </div>
        <hr class="border-grey-200" />
      </template>
    </section>
  </Panel>
</template>

<style>
.FoundationRiskPanel .content hr:last-child {
  display: none;
}
</style>