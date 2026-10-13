<script setup lang="ts">
/**
 * Based on the active mapset, building details are shown at the top of the right sidebar
 */

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useMapsetStore } from '@/store/mapsets'
import { useBuildingStore } from '@/store/buildings';
import { useAnalysisStore } from '@/store/building/analysis';
import { useInquiriesStore } from '@/store/building/inquiries';
import { useIncidentReportsStore } from '@/store/building/incidents';

import { FieldDataConfig, applyContextToFieldDataConfigs, retrieveAndFormatFieldData } from '@/utils/fieldData';


const { activeMapset } = storeToRefs(useMapsetStore())
const { buildingId } = storeToRefs(useBuildingStore())
const analysisStore = useAnalysisStore()
const inquiriesStore = useInquiriesStore()
const { getIncidentReportsByBuildingId } = useIncidentReportsStore()


const analysisData = computed(() => {
  if (! buildingId.value) return null
  return analysisStore.getData(buildingId.value)
})

const inquiryData = computed(() => {
  if (! buildingId.value) return []
  return inquiriesStore.getReportsWithSamples(buildingId.value) || []
})


const incidentData = computed(() => {
  if (! buildingId.value) return []
  return getIncidentReportsByBuildingId(buildingId.value) || []
})

// The mapsets that have a summary. By id: their names and slugs can be edited.
const MAPSET = {
  rapportage: 'clcqk9m5n000a14qel71c83m2',
  risico: 'clcqkaaea000714o1v1jmdqwf',
  fundering: 'clcqkb4vp006w14qhzv7rfznm',
  pand: 'clcqk8r6a005h14t9wt3u61bv',
  quickscan: 'cliynyd6g01b801pges0bb7wh',
  incidenten: 'cl2nh0ez3000y14o1nduwbsv5',
}

const title = computed<string|null>(() => {

  // No building = no need for details
  if (! buildingId.value) return null

  switch(activeMapset.value?.id) {
    case MAPSET.rapportage:
      return 'Rapportage-informatie'
    case MAPSET.risico:
      return 'Risico-informatie' 
    case MAPSET.fundering:
      return 'Funderingsinformatie'
    case MAPSET.pand:
      return 'Pandinformatie'
    case MAPSET.quickscan:
      return null // no title
    case MAPSET.incidenten:
      return 'Incidentinformatie'
  }

  return null
})

/**
 * The rows per mapset. Every row reads the same as in the panel it comes
 *  from (label, value, formatting): the summary repeats, it does not rephrase.
 */
const allFields = computed(() => {

  // No building = no need for details
  if (! buildingId.value) return []

  switch(activeMapset.value?.id) {
    // The onderzoek the onderzoek panel opens on: the last one that was added or changed
    case MAPSET.rapportage:
      if (! Array.isArray(inquiryData.value) || inquiryData.value.length === 0) return []

      return applyContextToFieldDataConfigs({
        source: inquiryData.value?.[0]?.report,
        configs: [
          new FieldDataConfig({ name: 'documentName' }),
          new FieldDataConfig({ name: 'id' }),
          new FieldDataConfig({ name: 'type' }),
          new FieldDataConfig({ name: 'documentDate' }),
          new FieldDataConfig({ name: 'contractorName', source: inquiryData.value?.[0]?.report?.attribution }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    // The three risks of the model. Not the risk "op basis van onderzoek"
    // (unclassifiedRisk): its row is called "Vastgesteld", which says too
    // little without the heading it has in the risk panel.
    case MAPSET.risico:
      if (analysisData.value === null) return []

      return applyContextToFieldDataConfigs({
        source: analysisData.value,
        configs: [
          new FieldDataConfig({ name: 'drystandRisk' }),
          new FieldDataConfig({ name: 'dewateringDepthRisk' }),
          new FieldDataConfig({ name: 'bioInfectionRisk' }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    // As the fundering panel has them, the herstelmethode included
    case MAPSET.fundering:
      if (analysisData.value === null) return []

      return applyContextToFieldDataConfigs({
        source: analysisData.value,
        configs: [
          new FieldDataConfig({ name: 'foundationType' }),
          new FieldDataConfig({ name: 'foundationTypeReliability' }),
          new FieldDataConfig({ name: 'velocity' }),
          new FieldDataConfig({ name: 'recoveryType' }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    // The id of the pand is in the heading above
    case MAPSET.pand:
      if (analysisData.value === null) return []

      return applyContextToFieldDataConfigs({
        source: analysisData.value,
        configs: [
          new FieldDataConfig({ name: 'constructionYear' }),
          new FieldDataConfig({ name: 'surfaceArea' }),
        ]
      })
      .map(retrieveAndFormatFieldData)

    case MAPSET.quickscan:
      return []

    // The last melding. Its address and meldingsloket are not in the data.
    case MAPSET.incidenten:
      if (! Array.isArray(incidentData.value) || incidentData.value.length === 0) return []

      return applyContextToFieldDataConfigs({
        source: incidentData.value[0],
        configs: [
          new FieldDataConfig({ name: 'id' }),
          new FieldDataConfig({ name: 'createDate' }),
        ]
      })
      .map(retrieveAndFormatFieldData)
  }

  return []
})

/**
 * Only rows that say something: a field without data is left out, where the
 *  panels show "Geen data" for it.
 */
const fields = computed(() => {
  return allFields.value.filter(field => {
    const raw = field.getValue('raw')
    const value = field.value

    return raw !== undefined && raw !== null && raw !== ''
      && value !== undefined && value !== null && value !== ''
  })
})


</script>

<template>
  <section 
    v-if="fields.length !== 0"
    class="space-y-2 rounded-lg border border-grey-400 p-4">
    <h6 v-if="title" class="heading-6">{{ title }}</h6>
    <ul class="space-y-1 text-(--color-text-muted)">
      <li 
        v-for="item in fields"
        :key="item.name">{{ item.label }}: {{ item.value }}</li>
    </ul>
  </section>
</template>