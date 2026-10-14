<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import InformationModal from '@/components/Common/InformationModal.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs, CompletedFieldData } from '@/utils/fieldData'

import { useInquiriesStore } from '@/store/building/inquiries';
import { useBuildingStore } from '@/store/buildings';


const inquiriesStore = useInquiriesStore()
const { isSamplePanelOpen, shownReportIndex, shownSampleIndex, shownSampleLabel } = storeToRefs(inquiriesStore)
const { buildingId } = storeToRefs(useBuildingStore())


/**
 * Data source for panel
 */
const caseItems = computed(() => {
  if (! buildingId.value) return []
  return inquiriesStore.getReportsWithSamples(buildingId.value) || []
})


/**
 * The sample the panel asked for: of the report it shows, the one of the
 *  button that was pressed. Or null
 */
const selectedSample = computed(() => {
  // The same report as the panel shows: its page, held within the reports of this pand
  const shownIndex = Math.min(shownReportIndex.value, caseItems.value.length - 1)
  return caseItems.value[shownIndex]?.samples[shownSampleIndex.value] ?? null
})

/**
 * Whether there is sample data to be shown
 */
const hasSampleData = computed(() => {
  return !! selectedSample.value
})

/**
 * Of a report with several samples the dialog says which one it shows
 */
const title = computed(() => {
  return shownSampleLabel.value ? `Onderzoeksinformatie: ${shownSampleLabel.value}` : 'Onderzoeksinformatie'
})

const fieldGroupHeaders: Record<string, string> = {
  building: 'Pand',
  environment: 'Omgeving',
  quality: 'Kwaliteit',
  pile: 'Palen & hout',
  constructionQuality: 'Kwaliteit metselwerk',
  skewed: 'Vervorming',
  crack: 'Scheuren',
  front: 'Voorgevel scheur',
  back: 'Achtergevel scheur',
  right: 'Rechtergevel scheur',
  left: 'Linkergevel scheur',
  report: 'Opmerking uit rapportage'
}

/**
 * Fields config
 */
const sampleFieldsWithData = computed(() => {
  if (! hasSampleData.value) return {}

  const sampleFieldsConfig = applyContextToFieldDataConfigs({
    source: selectedSample.value,
    configs: [

      // Pand
      new FieldDataConfig({ group: 'building', name: 'note' }),
      new FieldDataConfig({ group: 'building', name: 'builtYear' }),
      new FieldDataConfig({ group: 'building', name: 'substructure' }),
      new FieldDataConfig({ group: 'building', name: 'foundationType' }),
      new FieldDataConfig({ group: 'building', name: 'recoveryAdvised' }),

      // Omgeving
      new FieldDataConfig({ group: 'environment', name: 'cpt' }),
      new FieldDataConfig({ group: 'environment', name: 'groundLevel' }),
      new FieldDataConfig({ group: 'environment', name: 'groundwaterLevelNet' }),
      new FieldDataConfig({ group: 'environment', name: 'monitoringWell' }),
      new FieldDataConfig({ group: 'environment', name: 'groundwaterLevelTemp' }),

      // Kwaliteit
      new FieldDataConfig({ group: 'quality', name: 'enforcementTerm' }),
      new FieldDataConfig({ group: 'quality', name: 'damageCause' }),
      new FieldDataConfig({ group: 'quality', name: 'overallQuality' }),
      new FieldDataConfig({ group: 'quality', name: 'damageCharacteristics' }),

      // Palen & Hout
      new FieldDataConfig({ group: 'pile', name: 'pileHeadLevel' }),
      new FieldDataConfig({ group: 'pile', name: 'pileDiameterTop' }),
      new FieldDataConfig({ group: 'pile', name: 'pileDistanceLength' }),
      new FieldDataConfig({ group: 'pile', name: 'pileTipLevel' }),
      new FieldDataConfig({ group: 'pile', name: 'pileDiameterBottom' }),
      new FieldDataConfig({ group: 'pile', name: 'concreteChargerLength' }),
      new FieldDataConfig({ group: 'pile', name: 'woodType' }),
      new FieldDataConfig({ group: 'pile', name: 'woodPenetrationDepth' }),
      new FieldDataConfig({ group: 'pile', name: 'woodQuality' }),
      new FieldDataConfig({ group: 'pile', name: 'carryingCapacityQuality' }),
      new FieldDataConfig({ group: 'pile', name: 'woodEncroachement' }),
      new FieldDataConfig({ group: 'pile', name: 'pileWoodCapacityVerticalQuality' }),
      new FieldDataConfig({ group: 'pile', name: 'woodQualityNecessity' }),
      new FieldDataConfig({ group: 'pile', name: 'woodCapacityHorizontalQuality' }),

      // Kwaliteit metselwerk
      new FieldDataConfig({ group: 'constructionQuality', name: 'constructionQuality' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'foundationDepth' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'constructionLevel' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'woodLevel' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'masonLevel' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'masonQuality' }),
      new FieldDataConfig({ group: 'constructionQuality', name: 'constructionPile' }),

      // Vervorming
      new FieldDataConfig({ group: 'skewed', name: 'settlementSpeed' }),
      new FieldDataConfig({ group: 'skewed', name: 'deformedFacade' }),
      new FieldDataConfig({ group: 'skewed', name: 'skewedParallelFacade' }),
      new FieldDataConfig({ group: 'skewed', name: 'skewedParallel' }),
      new FieldDataConfig({ group: 'skewed', name: 'thresholdFrontLevel' }),
      new FieldDataConfig({ group: 'skewed', name: 'skewedWindowFrame' }),
      new FieldDataConfig({ group: 'skewed', name: 'thresholdUpdownSkewed' }),
      new FieldDataConfig({ group: 'skewed', name: 'skewedPerpendicularFacade' }),
      new FieldDataConfig({ group: 'skewed', name: 'skewedPerpendicular' }),
      new FieldDataConfig({ group: 'skewed', name: 'thresholdBackLevel' }),

      // Scheuren
      new FieldDataConfig({ group: 'crack', name: 'crackIndoorRestored' }),
      new FieldDataConfig({ group: 'crack', name: 'crackIndoorType' }),
      new FieldDataConfig({ group: 'crack', name: 'crackIndoorSize' }),

      // Voorgevel scheur
      new FieldDataConfig({ group: 'front', name: 'crackFacadeFrontRestored' }),
      new FieldDataConfig({ group: 'front', name: 'crackFacadeFrontType' }),
      new FieldDataConfig({ group: 'front', name: 'crackFacadeFrontSize' }),

      // Achtergevel scheur
      new FieldDataConfig({ group: 'back', name: 'crackFacadeBackRestored' }),
      new FieldDataConfig({ group: 'back', name: 'crackFacadeBackType' }),
      new FieldDataConfig({ group: 'back', name: 'crackFacadeBackSize' }),

      // Linkergevel scheur
      new FieldDataConfig({ group: 'left', name: 'crackFacadeLeftRestored' }),
      new FieldDataConfig({ group: 'left', name: 'crackFacadeLeftType' }),
      new FieldDataConfig({ group: 'left', name: 'crackFacadeLeftSize' }),

      // Rechter gevel scheur
      new FieldDataConfig({ group: 'right', name: 'crackFacadeRightRestored' }),
      new FieldDataConfig({ group: 'right', name: 'crackFacadeRightType' }),
      new FieldDataConfig({ group: 'right', name: 'crackFacadeRightSize' }),

    ]
  })

  return sampleFieldsConfig
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


/**
 * Close the modal
 */
const handleClose = function handleClose() {
  isSamplePanelOpen.value = false
}

/**
 * Auto close the modal if there is no sample data to be shown
 *  Only then: the sample can also appear at the moment the dialog opens (the
 *  panel names the sample as it opens the dialog), and that closed it again.
 */
watch(
  () => hasSampleData.value,
  (hasData) => {
    if (! hasData && isSamplePanelOpen.value) {
      handleClose()
    }
  }
)

</script>

<template>
  <InformationModal 
    v-if="isSamplePanelOpen"
    :title="title"
    class="InquirySampleModal"
    @close="handleClose">

    <template v-for="group in Object.keys(fieldGroupHeaders)" :key="group">
      <section
        v-if="sampleFieldsWithData[group]"
        class="space-y-4">
        <h6 class="heading-6">{{ fieldGroupHeaders[group] }}</h6>
        <dl class="list--definition">
          <div 
            v-for="field in sampleFieldsWithData[group]" 
            :key="field.name"
            class="item">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>
      </section>
      
      <hr class="border-grey-200" />
    </template>

  </InformationModal>
</template>

