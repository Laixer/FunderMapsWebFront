<script setup lang="ts">
import { ComputedRef, Ref, computed, onBeforeUnmount, ref, watch } from 'vue'; 
import { storeToRefs } from 'pinia';

// import TextClamp from 'vue3-text-clamp';

import { IIncidentReport } from '@/datastructures/interfaces';

import Panel from '@/components/Common/Panel.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';

import LeftArrowIcon from '@assets/svg/icons/arrow-left.svg'
import RightArrowIcon from '@assets/svg/icons/arrow-right.svg'
import InfoIcon from '@assets/svg/icons/info.svg'

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'

import { useIncidentReportsStore } from '@/store/building/incidents';
import { useBuildingStore } from '@/store/buildings';
import { useMainStore } from '@/store/main';


const { remarkPopoverTitle, remarkPopoverText, isRemarkPopoverOpen } = storeToRefs(useMainStore())
const { 
  getIncidentReportsByBuildingId, 
  buildingIncidentReportDataHasBeenRetrieved,
  buildingHasIncidentReports 
} = useIncidentReportsStore()
const { buildingId } = storeToRefs(useBuildingStore())

/**
 * Props & events
 */ 
defineProps({ address: { type: String } })
const emit = defineEmits(['close', 'back'])

/**
 * Whether the note is clamped
 */
const isClamped = ref(false)

/**
 * Data source for panel
 */
const caseItems: ComputedRef<IIncidentReport[]> = computed(() => {
  if (! buildingId.value) return []
  return getIncidentReportsByBuildingId(buildingId.value) || []
})

/**
 * Check whether there is relevant data available for this panel
 */
const noCaseItemAvailableForBuilding: ComputedRef<boolean> = computed(() => {
  if (! buildingId.value) return false
  return (
    buildingIncidentReportDataHasBeenRetrieved(buildingId.value) 
    && ! buildingHasIncidentReports(buildingId.value)
  )
})

/**
 * Selected index from list
 *  Note: we start counting at 0
 * 
 * // TODO: Reset to 0 if buildingId changes
 */
const selectedListIndex: Ref<number> = ref(0)
const maxListIndex: ComputedRef<number> = computed(() => {
  return caseItems.value.length < 1 
    ? 0
    : (caseItems.value.length - 1)
})

/**
 * The selected case item, or null
 */
const selectedCaseItem: ComputedRef<IIncidentReport|null> = computed(() => {
  if (caseItems.value[selectedListIndex.value]) {
    return caseItems.value[selectedListIndex.value]
  }
  return null
})

const selectedCaseItemTitle: ComputedRef<string> = computed(() => {
  return selectedCaseItem.value?.id || ''
})

/**
 * Fields config
 *  TODO: formatter based on 'prefix', 'suffix', 'decimal'
 *  TODO: formatter based on central config, like field labels
 */

const fieldsWithData = computed(() => {
  if (selectedCaseItem.value === null) return []

  const fieldsConfig = applyContextToFieldDataConfigs({
    source: selectedCaseItem,
    configs: [
      new FieldDataConfig({ name: 'id' }),
      // new FieldDataConfig({ name: 'address' }),
      new FieldDataConfig({ name: 'building' }),
      new FieldDataConfig({ name: 'clientName' }),
      new FieldDataConfig({ name: 'createDate' }),
      new FieldDataConfig({ name: 'foundationType' }),
      new FieldDataConfig({ name: 'chainedBuilding' }),
      new FieldDataConfig({ name: 'owner' }),
      new FieldDataConfig({ name: 'foundationRecovery' }),
      new FieldDataConfig({ name: 'neighborRecovery' }),
      new FieldDataConfig({ name: 'foundationDamageCause' }),
      new FieldDataConfig({ name: 'note' }),
      new FieldDataConfig({ name: 'name' }),
      new FieldDataConfig({ name: 'phoneNumber' }),
      new FieldDataConfig({ name: 'email' }),
      new FieldDataConfig({ name: 'foundationDamageCharacteristics' }),
      new FieldDataConfig({ name: 'environmentDamageCharacteristics' }),
      new FieldDataConfig({ name: 'auditStatus' }),
      // new FieldDataConfig({ name: 'documentFile' }),
      new FieldDataConfig({ name: 'internalNote' }),
      new FieldDataConfig({ name: 'questionType' })
    ]
  })
  return fieldsConfig.map(retrieveAndFormatFieldData)
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
        new FieldDataConfig({ name: 'note', source: caseItem })
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
const handleNext = function handleNext() {
  if (selectedListIndex.value === maxListIndex.value) return
  selectedListIndex.value = selectedListIndex.value + 1
}

const handlePrev = function handlePrev() {
  if (selectedListIndex.value < 1) return
  selectedListIndex.value = selectedListIndex.value - 1
}

const resetListValue = function resetListValue() {
  selectedListIndex.value = 0
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
const handleClamped = function handleClamped(clamped: boolean) {
  isClamped.value = clamped
}

</script>

<template>
  <Panel 
    title="Incident rapportage" 
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
          v-if="maxListIndex > 1" 
          class="flex gap-0.5 whitespace-nowrap">
          <button 
            class="button button--link p-1" 
            :disabled="selectedListIndex === 0"
            @click.prevent="handlePrev">
            <LeftArrowIcon
              class="aspect-square h-2.5"
              aria-hidden="true"
            />
            <span class="sr-only">Vorige</span>
          </button>
          <span>{{ selectedListIndex + 1 }}/{{ maxListIndex + 1 }}</span>
          <button 
            class="button button--link p-1" 
            :disabled="selectedListIndex === maxListIndex"
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
        <h6 class="font-bold leading-none">Incident informatie</h6>
        <dl class="space-y-3">
          <div 
            v-for="field in fieldsWithData" 
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
              <!-- <TextClamp 
                v-if="field.name === 'note'" 
                :text="field.value" 
                :max-lines="3"
                @clampChange="handleClamped" />
              <span v-else>{{ field.value }}</span> -->
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </Panel>
</template>