<script setup lang="ts">
import { ComputedRef, computed, onBeforeUnmount, ref, watch } from 'vue'; 
import { storeToRefs } from 'pinia';

// import TextClamp from 'vue3-text-clamp';

import { ICombinedRecoveryData } from '@/datastructures/interfaces';
import Panel from '@/components/Common/Panel.vue';
import BuildingIdHeader from '@/components/BuildingIdHeader.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';
import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';

import LeftArrowIcon from '@assets/svg/icons/arrow-left.svg'
import RightArrowIcon from '@assets/svg/icons/arrow-right.svg'
import InfoIcon from '@assets/svg/icons/info.svg'

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useRecoveryReportsStore } from '@/store/building/recovery';
import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';


const { getCombinedRecoveryDataByBuildingId, buildingHasRecoveryReports, buildingRecoveryReportDataHasBeenRetrieved } = useRecoveryReportsStore()
const { shownReportIndex, isSamplePanelOpen } = storeToRefs(useRecoveryReportsStore())
const { buildingId } = storeToRefs(useBuildingStore())
const { remarkPopoverTitle, remarkPopoverText, isRemarkPopoverOpen } = storeToRefs(useMainStore())

/**
 * Props & events
 */ 
const emit = defineEmits(['close', 'back'])

/**
 * Whether the note is clamped
 */
const isClamped = ref(false)

/******************************************************************************
 * Main Recovery report
 */
const caseItems: ComputedRef<ICombinedRecoveryData[]> = computed(() => {
  if (! buildingId.value) return []
  return getCombinedRecoveryDataByBuildingId(buildingId.value) || []
})

/**
 * Check whether there is relevant data available for this panel
 */
const noCaseItemAvailableForBuilding: ComputedRef<boolean> = computed(() => {
  if (! buildingId.value) return false
  return (
    buildingRecoveryReportDataHasBeenRetrieved(buildingId.value) 
    && ! buildingHasRecoveryReports(buildingId.value)
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
 const selectedCaseItem: ComputedRef<ICombinedRecoveryData|null> = computed(() => {
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
      new FieldDataConfig({ name: 'contractorName', source: selectedCaseItem.value?.report.attribution }), 
      new FieldDataConfig({ name: 'ownerName', source: selectedCaseItem.value?.report.attribution }),
      new FieldDataConfig({ name: 'creatorName', source: selectedCaseItem.value?.report.attribution }),
      new FieldDataConfig({ name: 'reviewerName', source: selectedCaseItem.value?.report.attribution }),
      new FieldDataConfig({ name: 'documentFile' }),
      new FieldDataConfig({ name: 'note' }),
      new FieldDataConfig({ name: 'auditStatus' }),
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

watch(
  () => selectedCaseItem.value,
  (caseItem) => {

    // Whatever changes, close the popover
    isRemarkPopoverOpen.value = false

    if (caseItem) {
      const noteFieldData = retrieveAndFormatFieldData(
        new FieldDataConfig({ name: 'note', source: caseItem.report })
      )

      remarkPopoverTitle.value = noteFieldData.label || ''
      remarkPopoverText.value = noteFieldData?.value?.toString() || ''
    }
  }, 
  { immediate: true }
)

onBeforeUnmount(() => isRemarkPopoverOpen.value = false)

/**
 * Navigation between cases
 */
const handleNextMain = function handleNextMain() {
  if (shownReportIndex.value === maxListIndex.value) return
  shownReportIndex.value = shownReportIndex.value + 1
}

const handlePrevMain = function handlePrevMain() {
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


/**
 * Handle opening the remark popover
 */
const handleOpenRemarkPopover = function handleOpenRemarkPopover() {
  isRemarkPopoverOpen.value = true
}

/**
 * Fires when the remarks are clamped
 */
const handleClamped = function handleClamped(clamped: CustomEvent) {
  isClamped.value = !! clamped.detail
}

</script>

<template>
  <Panel 
    title="Herstel informatie" 
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
      <div class="flex gap-4 w-full justify-between">
        <h5 class="truncate" :title="selectedCaseItemTitle+''">{{ selectedCaseItemTitle }}</h5>

        <!-- START Prev / next nav component -->
        <div 
          v-if="maxListIndex > 0" 
          class="flex gap-0.5 whitespace-nowrap">
          <button 
            class="button button--link p-1" 
            :disabled="shownReportIndex === 0"
            @click.prevent="handlePrevMain">
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
            @click.prevent="handleNextMain">
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
        <h6 class="font-bold leading-none">Rapportage informatie</h6>
        <dl class="space-y-3">
          <div 
            v-for="field in reportFieldsWithData" 
            :key="field.name">
            <dt>
              <span>{{ field.label }}</span>
              <button
                v-if="field.name === 'note' && isClamped === true"
                class="-ml-1 p-2 text-green-500 hover:text-green-700"
                type="button"
                @click.prevent="handleOpenRemarkPopover"
              >
                <InfoIcon
                  class="aspect-square w-4"
                  aria-hidden="true"
                />
              </button>
            </dt>
            <dd class="text-grey-700">
              <p 
                v-if="field.name === 'note'" 
                v-line-clamp="3"
                @clamped="handleClamped">{{ field.value }}</p>
              <span v-else>{{ field.value }}</span>
            </dd>
          </div>
        </dl>
      </div>

      <OutlineButton
        label="Bekijk de herstelinformatie"
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