<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import InformationModal from '@/components/Common/InformationModal.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useRecoveryReportsStore } from '@/store/building/recovery';
import { useBuildingStore } from '@/store/buildings';


const recoveryStore = useRecoveryReportsStore()
const { shownReportIndex, shownSampleIndex, shownSampleLabel, isSamplePanelOpen } = storeToRefs(recoveryStore)
const { buildingId } = storeToRefs(useBuildingStore())


/**
 * Data source for panel
 */
const caseItems = computed(() => {
  if (! buildingId.value) return []
  return recoveryStore.getReportsWithSamples(buildingId.value) || []
})


/**
 * The sample the panel asked for: of the report it shows, the one of the
 *  button that was pressed. Or null
 */
const selectedSample = computed(() => {
  return caseItems.value[shownReportIndex.value]?.samples[shownSampleIndex.value] ?? null
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
  return shownSampleLabel.value ? `Herstelinformatie: ${shownSampleLabel.value}` : 'Herstelinformatie'
})

/**
 * Fields config
 */
const sampleFieldsWithData = computed(() => {
  if (! hasSampleData.value) return []

  const sampleFieldsConfig = applyContextToFieldDataConfigs({
    source: selectedSample.value,
    configs: [
      // Pand 
      new FieldDataConfig({ name: 'recovery' }),
      new FieldDataConfig({ name: 'type' }),
      new FieldDataConfig({ name: 'pileType' }),
      new FieldDataConfig({ name: 'status' }),
      new FieldDataConfig({ name: 'note' }),
      new FieldDataConfig({ name: 'contractor' }),
      new FieldDataConfig({ name: 'facade' }),
      new FieldDataConfig({ name: 'permit' }),
      new FieldDataConfig({ name: 'permitDate' }),
      new FieldDataConfig({ name: 'recoveryDate' }),
      new FieldDataConfig({ name: 'id' }),
    ]
  })

  return sampleFieldsConfig.map(retrieveAndFormatFieldData)
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
    class="RecoverySampleModal"
    @close="handleClose">

    <section 
      class="space-y-4">
      <dl class="list--definition">
        <div 
          v-for="field in sampleFieldsWithData" 
          :key="field.name"
          class="item">
          <dt>{{ field.label }}</dt>
          <dd>{{ field.value }}</dd>
        </div>
      </dl>
    </section>

  </InformationModal>
</template>

<style scoped>
.RecoverySampleModal .panel__content hr:last-child {
  display: none;
}
</style>

