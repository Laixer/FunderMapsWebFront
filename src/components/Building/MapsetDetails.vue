<script setup lang="ts">
/**
 * Based on the active mapset, building details are shown at the top of the right sidebar
 */

import { type ComputedRef, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useMapsetStore } from '@/store/mapsets'
import { useBuildingStore } from '@/store/buildings';
import { useAnalysisStore } from '@/store/building/analysis';
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useInquiriesStore } from '@/store/building/inquiries';
import { useRecoveryReportsStore } from '@/store/building/recovery';
import { useIncidentReportsStore } from '@/store/building/incidents';

import { FieldDataConfig, applyContextToFieldDataConfigs, retrieveAndFormatFieldData, type CompletedFieldData } from '@/utils/fieldData';
import { ICombinedRecoveryData, IIncidentReport } from '@/datastructures/interfaces';


const { activeMapsetId } = storeToRefs(useMapsetStore())
const { buildingId } = storeToRefs(useBuildingStore())
const { getAnalysisDataByBuildingId } = useAnalysisStore()
const { getLocationDataByBuildingId } = useGeoLocationsStore()
const { getCombinedInquiryDataByBuildingId } = useInquiriesStore()
const { getCombinedRecoveryDataByBuildingId } = useRecoveryReportsStore()
const { getIncidentReportsByBuildingId } = useIncidentReportsStore()


const analysisData = computed(() => {
  if (! buildingId.value) return null
  return getAnalysisDataByBuildingId(buildingId.value)
})

const locationData = computed(() => {
  if (! buildingId.value) return null
  return getLocationDataByBuildingId(buildingId.value)
})

const inquiryData = computed(() => {
  if (! buildingId.value) return []
  return getCombinedInquiryDataByBuildingId(buildingId.value) || []
})

const recoveryData: ComputedRef<ICombinedRecoveryData[]> = computed(() => {
  if (! buildingId.value) return []
  return getCombinedRecoveryDataByBuildingId(buildingId.value) || []
})


const incidentData: ComputedRef<IIncidentReport[]> = computed(() => {
  if (! buildingId.value) return []
  return getIncidentReportsByBuildingId(buildingId.value) || []
})

const title = computed<string|null>(() => {

  // No building = no need for details
  if (! buildingId.value) return null

  switch(activeMapsetId.value) {
    case '0afd6eef-b056-4c33-bf61-883864fdfe98': // Rapportage
      return 'Rapportage informatie'
    case '79686171-6564-463f-8046-41a9a9ead55f': // Risico
      return 'Risico informatie' 
    case 'c81d4c1b-cc11-4f80-b324-9ab7e6cefd99': // Fundering
      return 'Funderingsinformatie'
    case '8de9bc42-829c-4df2-b75f-c8c392e18e76': // pand
      return 'Pandinformatie'
    case '42ddf102-a8bd-4076-9336-27781eb069c8': // Gevelscan
      return null // no title
    case '0f3080d3-1ecc-4d05-a55a-62ef3c4c74b7': // Incidenten
      return 'Incident informatie'
  }

  return null
})

const fields: ComputedRef<CompletedFieldData[]> = computed(() => {

  // No building = no need for details
  if (! buildingId.value) return []

  switch(activeMapsetId.value) {
    case '0afd6eef-b056-4c33-bf61-883864fdfe98': // Rapportage
      if (! Array.isArray(inquiryData.value) || inquiryData.value.length === 0) return []

      return applyContextToFieldDataConfigs({
        source: inquiryData.value?.[0]?.report,
        configs: [
          new FieldDataConfig({ name: 'documentName' }),
          new FieldDataConfig({ name: 'id' }),
          new FieldDataConfig({ name: 'type' }),
          new FieldDataConfig({ name: 'documentDate' }),
          new FieldDataConfig({ name: 'contractor', source: inquiryData.value?.[0]?.report?.attribution }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    case '79686171-6564-463f-8046-41a9a9ead55f': // Risico
      if (analysisData.value === null) return []

      return applyContextToFieldDataConfigs({
        source: analysisData.value,
        configs: [
          new FieldDataConfig({ name: 'drystandRisk' }),
          new FieldDataConfig({ name: 'dewateringDepthRisk' }),
          new FieldDataConfig({ name: 'bioInfectionRisk' }),
          new FieldDataConfig({ name: 'unclassifiedRisk' }),
          new FieldDataConfig({ name: 'facadescanRisk' }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    case 'c81d4c1b-cc11-4f80-b324-9ab7e6cefd99': // Fundering
      if (analysisData.value === null) return []

      const configs = [
        new FieldDataConfig({ name: 'foundationType' }),
        new FieldDataConfig({ name: 'foundationTypeReliability' }),
        new FieldDataConfig({ name: 'velocity' })
      ]

      if (Array.isArray(recoveryData.value) && recoveryData.value.length !== 0) {
        configs.push(new FieldDataConfig({ name: 'recovery', source: recoveryData.value[0].sample }))
        configs.push(new FieldDataConfig({ name: 'type', source: recoveryData.value[0].sample }))
      }

      return applyContextToFieldDataConfigs({
        source: analysisData.value,
        configs
      })
      .map(retrieveAndFormatFieldData)

    case '8de9bc42-829c-4df2-b75f-c8c392e18e76':  // pand / gebouw
      if (analysisData.value === null || locationData.value === null) return []

      return applyContextToFieldDataConfigs({
        source: analysisData,
        configs: [
          new FieldDataConfig({ name: 'externalId', source: locationData.value?.building }),
          new FieldDataConfig({ name: 'constructionYear' }),
          new FieldDataConfig({ name: 'surfaceArea' }),
          // TODO: owner field - not yet available
          // TODO: # address count - not yet available
        ]
      })
      .map(retrieveAndFormatFieldData)

    case '42ddf102-a8bd-4076-9336-27781eb069c8': // Gevelscan
      return []

    case '0f3080d3-1ecc-4d05-a55a-62ef3c4c74b7': // Incidenten
      if (! Array.isArray(incidentData.value) || incidentData.value.length === 0) return []

      return applyContextToFieldDataConfigs({
        source: incidentData.value[0],
        configs: [
          new FieldDataConfig({ name: 'id' }),
          new FieldDataConfig({ name: 'address' }),
          new FieldDataConfig({ name: 'building' }),
          new FieldDataConfig({ name: 'clientId' }),
          new FieldDataConfig({ name: 'createDate' }),
        ]
      })
      .map(retrieveAndFormatFieldData)
  }

  return []
})


</script>

<template>
  <section 
    v-if="fields.length !== 0"
    class="space-y-2 rounded-lg border border-grey-400 p-4">
    <h6 v-if="title" class="heading-6">{{ title }}</h6>
    <ul class="space-y-1 text-grey-700">
      <li 
        v-for="item in fields"
        :key="item.label">{{ item.label }}: {{ item.value || 'Onbekend' }}</li>
    </ul>
  </section>
</template>