<script setup lang="ts">
import { ComputedRef, computed, watch } from 'vue'; 
import { storeToRefs } from 'pinia';

import { ICombinedInquiryData } from '@/datastructures/interfaces';
import Panel from '@/components/Common/Panel.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';
import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';

import LeftArrowIcon from '@assets/svg/icons/arrow-left.svg'
import RightArrowIcon from '@assets/svg/icons/arrow-right.svg'

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useBuildingStore } from '@/store/buildings';
import { useInquiriesStore } from '@/store/building/inquiries';

const { getCombinedInquiryDataByBuildingId, buildingInquiryDataHasBeenRetrieved, buildingHasInquiries } = useInquiriesStore()
const { shownReportIndex, isSamplePanelOpen } = storeToRefs(useInquiriesStore())
const { buildingId } = storeToRefs(useBuildingStore())

/**
 * Props & events
 */ 
defineProps({ address: { type: String } })
const emit = defineEmits(['close', 'back'])

/**
 * Data source for panel
 */
const caseItems: ComputedRef<ICombinedInquiryData[]> = computed(() => {
  if (! buildingId.value) return []
  return getCombinedInquiryDataByBuildingId(buildingId.value) || []
})

/**
 * Check whether there is relevant data available for this panel
 */
const noCaseItemAvailableForBuilding: ComputedRef<boolean> = computed(() => {
  if (! buildingId.value) return false
  return (
    buildingInquiryDataHasBeenRetrieved(buildingId.value) 
    && ! buildingHasInquiries(buildingId.value)
  )
})

/**
 * Selected index from list
 *  Note: we start counting at 0
 */
const maxListIndex: ComputedRef<number> = computed(() => {
  return caseItems.value.length < 1 
    ? 0
    : (caseItems.value.length - 1)
})

/**
 * The selected case item, or null
 */
const selectedCaseItem: ComputedRef<ICombinedInquiryData|null> = computed(() => {
  if (caseItems.value[shownReportIndex.value]) {
    return caseItems.value[shownReportIndex.value]
  }
  return null
})

/**
 * The title of the selected report
 */
const selectedCaseItemTitle: ComputedRef<string|number> = computed(() => {
  return selectedCaseItem.value?.report?.documentName || ''
})

/**
 * Fields config
 */
const reportFieldsWithData = computed(() => {
  if (selectedCaseItem.value === null) return []

  const reportFieldsConfig = applyContextToFieldDataConfigs({
    source: selectedCaseItem.value?.report,
    configs: [
    new FieldDataConfig({ name: 'documentName' }),
    new FieldDataConfig({ name: 'id' }),
    new FieldDataConfig({ name: 'type' }),
    new FieldDataConfig({ name: 'documentDate' }),
    new FieldDataConfig({ name: 'contractor', source: selectedCaseItem.value?.report.attribution }),
    new FieldDataConfig({ name: 'owner', source: selectedCaseItem.value?.report.attribution }),
    new FieldDataConfig({ name: 'creator', source: selectedCaseItem.value?.report.attribution }),
    new FieldDataConfig({ name: 'reviewer', source: selectedCaseItem.value?.report.attribution }),
    new FieldDataConfig({ name: 'auditStatus', source: selectedCaseItem.value?.report.state }),
    new FieldDataConfig({ name: 'standardF3o' }),
    new FieldDataConfig({ name: 'inspection' }),
    // new FieldDataConfig({ name: 'link naar rapport' }),
    new FieldDataConfig({ name: 'jointMeasurement' }),
    new FieldDataConfig({ name: 'floorMeasurement' }),
    // new FieldDataConfig({ name: 'note' })
    ]
  })

  return reportFieldsConfig.map(retrieveAndFormatFieldData)
})

/**
 * Whether sample information is available for this report
 */
const hasSampleData = computed(() => {
  return !! (selectedCaseItem.value?.sample)
})

/**
 * When the building changes, reset the selectedIndex
 */
watch(
  () => buildingId.value, 
  () => resetListValue()
)

/**
 * Close the panel if there is no data for this building
 */
watch(
  () => noCaseItemAvailableForBuilding.value, 
  (value) => {
    if (value === true) {
      emit('back')
    }
  }
)


/**
 * Navigation between cases
 */
const handleNext = function handleNext() {
  if (shownReportIndex.value === maxListIndex.value) return
  shownReportIndex.value = shownReportIndex.value + 1
}

const handlePrev = function handlePrev() {
  if (shownReportIndex.value < 1) return
  shownReportIndex.value = shownReportIndex.value - 1
}

const resetListValue = function resetListValue() {
  shownReportIndex.value = 0
}

/**
 * Handle opening the sample modal
 */
const handleOpenModal = function handleOpenModal() {
  if (hasSampleData.value) {
    isSamplePanelOpen.value = true
  }
}

</script>

<template>
  <Panel 
    title="Onderzoeks informatie" 
    :subtitle="address || ''"
    @close="emit('close')">

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar Pand informatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <div class="flex gap-4 w-full justify-between">
        <h5 class="truncate">{{ selectedCaseItemTitle }}</h5>

        <!-- START Prev / next nav component -->
        <div 
          v-if="maxListIndex > 0" 
          class="flex gap-0.5 whitespace-nowrap">
          <button 
            class="button button--link p-1" 
            :disabled="shownReportIndex === 0"
            @click.prevent="handlePrev">
            <LeftArrowIcon
              class="aspect-square h-2.5"
              aria-hidden="true"
            />
            <span class="sr-only">Vorige</span>
          </button>
          <span>{{ shownReportIndex + 1 }}/{{ maxListIndex + 1 }}</span>
          <button 
            class="button button--link p-1" 
            :disabled="shownReportIndex === maxListIndex"
            @click.prevent="handleNext">
            <RightArrowIcon
              class="aspect-square h-2.5"
              aria-hidden="true"
            />
            <span class="sr-only">Volgende</span>
          </button>
        </div>
        <!-- END Prev / next nav component -->
      </div>

      <div class="space-y-3">
        <h6 class="font-bold leading-none">Onderzoeks informatie</h6>
        <dl class="space-y-3">
          <div 
            v-for="field in reportFieldsWithData" 
            :key="field.name">
            <dt>{{ field.label }}</dt>
            <dd class="text-grey-700">{{ field.value }}</dd>
          </div>
        </dl>
      </div>

      <OutlineButton
        label="Bekijk onderzoeksinformatie"
        :disabled="! hasSampleData"
        class="w-full"
        @click.prevent="handleOpenModal"
      >
        <template v-slot:after>
          <AnimatedArrowIcon />
        </template>
      </OutlineButton>
      
    </section>
  </Panel>
</template>