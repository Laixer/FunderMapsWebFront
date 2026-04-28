<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import InformationModal from '@/components/Common/InformationModal.vue';

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useRecoveryReportsStore } from '@/store/building/recovery';
import { useBuildingStore } from '@/store/buildings';


const recoveryStore = useRecoveryReportsStore()
const { shownReportIndex, isSamplePanelOpen } = storeToRefs(recoveryStore)
const { buildingId } = storeToRefs(useBuildingStore())


/**
 * Data source for panel
 */
const caseItems = computed(() => {
  if (! buildingId.value) return []
  return recoveryStore.getCombined(buildingId.value) || []
})


/**
 * The selected report item, or null
 */
const selectedCaseItem = computed(() => {
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

/**
 * Fields config
 */
const sampleFieldsWithData = computed(() => {
  if (! hasSampleData.value) return []

  const sampleFieldsConfig = applyContextToFieldDataConfigs({
    source: selectedCaseItem.value?.sample,
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
    title="Herstelinformatie" 
    class="RecoverySampleModal"
    @close="handleClose">

    <section 
      class="space-y-4">
      <dl role="list" class="list--definition">
        <div 
          v-for="field in sampleFieldsWithData" 
          :key="field.name"
          class="item">
          <dt>{{ field.label }}</dt>
          <dd class="text-grey-700">{{ field.value }}</dd>
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

