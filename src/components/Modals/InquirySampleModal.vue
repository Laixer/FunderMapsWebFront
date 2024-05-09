<script setup lang="ts">
import { ComputedRef, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { ICombinedInquiryData } from '@/datastructures/interfaces/index.ts';
import InformationModal from '@/components/Common/InformationModal.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs, CompletedFieldData } from '@/utils/fieldData'

import { useInquiriesStore } from '@/store/building/inquiries.ts';
import { useBuildingStore } from '@/store/buildings';


const { isSamplePanelOpen, shownReportIndex } = storeToRefs(useInquiriesStore())
const { getCombinedInquiryDataByBuildingId } = useInquiriesStore()
const { buildingId } = storeToRefs(useBuildingStore())


/**
 * Data source for panel
 */
const caseItems: ComputedRef<ICombinedInquiryData[]> = computed(() => {
  if (! buildingId.value) return []
  return getCombinedInquiryDataByBuildingId(buildingId.value) || []
})


/**
 * The selected inquiry case item, or null
 */
const selectedCaseItem: ComputedRef<ICombinedInquiryData|null> = computed(() => {
  if (caseItems.value[shownReportIndex.value]) {
    return caseItems.value[shownReportIndex.value]
  }
  return null
})

/**
 * Whether there is sample data to be shown
 */
const hasSampleData = computed(() => {
  return !! (selectedCaseItem.value?.sample)
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
const sampleFieldsWithData: ComputedRef<Record<string, CompletedFieldData[]>> = computed(() => {
  if (! hasSampleData.value) return {}

  const sampleFieldsConfig = applyContextToFieldDataConfigs({
    source: selectedCaseItem.value?.sample,
    configs: [

      // new FieldDataConfig({ name: 'address' }),
      // new FieldDataConfig({ name: 'building' }),

      // Pand 
      new FieldDataConfig({ group: 'building', name: 'note' }),
      new FieldDataConfig({ group: 'building', name: 'builtYear' }),
      new FieldDataConfig({ group: 'building', name: 'substructure' }),
      new FieldDataConfig({ group: 'building', name: 'foundationType', source: selectedCaseItem.value?.report }),
      new FieldDataConfig({ group: 'building', name: 'recoveryAdvised', source: selectedCaseItem.value?.report }),

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

      new FieldDataConfig({ group: 'report', name: 'note', source: selectedCaseItem.value?.report }),
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
 */
watch(
  () => hasSampleData.value,
  () => {
    if (isSamplePanelOpen.value) {
      handleClose()
    }
  }
)

</script>

<template>
  <InformationModal 
    v-if="isSamplePanelOpen"
    title="Onderzoeks informatie" 
    class="InquirySampleModal"
    @close="handleClose">

    <template v-for="group in Object.keys(fieldGroupHeaders)">
      <section 
        v-if="sampleFieldsWithData[group]"
        class="space-y-4">
        <h6>{{ fieldGroupHeaders[group] }}</h6>
        <dl role="list" class="list--definition">
          <div 
            v-for="field in sampleFieldsWithData[group]" 
            :key="field.name"
            class="item">
            <dt>{{ field.label }}</dt>
            <dd class="text-grey-700">{{ field.value }}</dd>
          </div>
        </dl>
      </section>
      
      <hr class="border-grey-200" />
    </template>

  </InformationModal>
</template>

<style>
/* .InquirySampleModal .panel__content hr:last-child {
  display: none;
} */
</style>

