<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';


import Panel from '@/components/Common/Panel.vue';
import BuildingIdHeader from '@/components/BuildingIdHeader.vue';
import BackLink from '@/components/Common/Links/BackLink.vue';
import OutlineButton from '@/components/Common/Buttons/OutlineButton.vue';

import LeftArrowIcon from '@assets/svg/icons/arrow-left.svg'
import RightArrowIcon from '@assets/svg/icons/arrow-right.svg'
import InfoIcon from '@assets/svg/icons/info.svg'

import { retrieveAndFormatFieldData, FieldDataConfig, applyContextToFieldDataConfigs } from '@/utils/fieldData'
import { useLeaveEmptyPanel } from '@/composables/useLeaveEmptyPanel'

import { useBuildingStore } from '@/store/buildings';
import { useInquiriesStore } from '@/store/building/inquiries';
import { useGeoLocationsStore } from '@/store/building/geolocations';
import { useMainStore } from '@/store/main';
import { useSessionStore } from '@/store/session';

import DocumentDownload from '@/components/DocumentDownload.vue';


const inquiriesStore = useInquiriesStore()
const locationStore = useGeoLocationsStore()
const { shownReportIndex, shownSampleIndex, shownSampleLabel, isSamplePanelOpen } = storeToRefs(inquiriesStore)
const { buildingId } = storeToRefs(useBuildingStore())
const { remarkPopoverTitle, remarkPopoverText, isRemarkPopoverOpen } = storeToRefs(useMainStore())
const { isAuthenticated } = storeToRefs(useSessionStore())

/**
 * Props & events
 */ 
const emit = defineEmits<{ close: []; back: [] }>()

/******************************************************************************
 * Refs & Computed 
 */

/**
 * Whether the note is clamped
 */
const isClamped = ref(false)

/**
 * Data source for panel: one item per onderzoek, with its samples on this pand
 */
const caseItems = computed(() => {
  if (! buildingId.value) return []
  return inquiriesStore.getReportsWithSamples(buildingId.value) || []
})

/**
 * Check whether there is relevant data available for this panel
 */
const noCaseItemAvailableForBuilding = computed(() => {
  if (! buildingId.value) return false
  return (
    inquiriesStore.hasBeenRetrieved(buildingId.value)
    && !inquiriesStore.hasReports(buildingId.value)
  )
})

/**
 * Selected index from list
 *  Note: we start counting at 0
 */
const maxListIndex = computed(() => {
  return caseItems.value.length < 1 
    ? 0
    : (caseItems.value.length - 1)
})

/**
 * The page the panel is on: the stored one, held within the reports of this
 *  pand. A page this pand does not have would show as an empty panel.
 */
const shownIndex = computed(() => Math.min(shownReportIndex.value, maxListIndex.value))

/**
 * The selected case item, or null
 */
const selectedCaseItem = computed(() => {
  if (caseItems.value[shownIndex.value]) {
    return caseItems.value[shownIndex.value]
  }
  return null
})

/**
 * The title of the selected report
 */
const selectedCaseItemTitle = computed(() => {
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
      new FieldDataConfig({ name: 'contractorName', source: selectedCaseItem.value?.report.attribution }),
      new FieldDataConfig({ name: 'ownerName', source: selectedCaseItem.value?.report.attribution }),
      new FieldDataConfig({ name: 'dataOwnerName', source: selectedCaseItem.value?.report.attribution }),
      // No "Verwerkt door" / "Gecontroleerd door": those are people (their e-mail
      // addresses). The organisation is the row "Opdrachtgever" above.
      new FieldDataConfig({ name: 'auditStatus', source: selectedCaseItem.value?.report.state }),
      new FieldDataConfig({ name: 'standardF3o' }),
      new FieldDataConfig({ name: 'inspection' }),
      new FieldDataConfig({ name: 'jointMeasurement' }),
      new FieldDataConfig({ name: 'floorMeasurement' }),
      new FieldDataConfig({ name: 'note' })
    ]
  })

  return reportFieldsConfig
    .map(retrieveAndFormatFieldData)
})

/**
 * The samples of this report on this pand. Mostly one; an onderzoek that
 *  covers several addresses of the pand has one per address.
 */
const samples = computed(() => selectedCaseItem.value?.samples ?? [])

/**
 * Whether sample information is available for this report
 */
const hasSampleData = computed(() => samples.value.length !== 0)

/**
 * With several samples there is a button per sample, named by its address
 *  (street and number). Until the address is known, or when it cannot be
 *  found: a number. The same address twice gets a number behind it.
 */
const sampleButtons = computed(() => {
  if (samples.value.length < 2) return []

  const names = samples.value.map(
    (sample, index) => locationStore.getAddressLabel(sample.address) || `Meting ${index + 1}`
  )

  return names
    .map((name, index) => {
      const isRepeated = names.indexOf(name) !== names.lastIndexOf(name)
      return {
        index,
        label: isRepeated ? `${name} (${names.slice(0, index + 1).filter(n => n === name).length})` : name
      }
    })
    // In the order of the street: 166 before 168 before 170
    .sort((a, b) => a.label.localeCompare(b.label, 'nl', { numeric: true }))
})

/**
 * Download information
 */
const downloadDetails = computed(() => {

  if (! buildingId.value) { 
    return null
  }

  const documentFile = selectedCaseItem.value?.report.documentFile
  if (! documentFile) { 
    return null
  }

  let filename = selectedCaseItem.value?.report.documentName || 'Onderzoeksdocument'

  // Inquiry source files are downloadable by any logged-in user: the API
  // serves them ownership-agnostically (#968), so hiding the button when the
  // report's owning org differs from the user's only blocked access to data
  // that was already reachable. Owner-org gating returns in the data-owner
  // epic (#973) once attribution is corrected via data_owner_organization_id.
  if (! isAuthenticated.value) {
    return null
  }

  // If we have a filename, that does not look to have an extension, while the document file appears to have one
  if (
    filename && 
    // No extension here
    filename.charAt(filename.length - 4) !== '.' && 
    filename.charAt(filename.length - 5) !== '.' && 
    // We do have an extension here
    ( 
      documentFile.charAt(documentFile.length - 4) === '.' ||
      documentFile.charAt(documentFile.length - 5) === '.' 
    )
  ) {
    const ext = documentFile.split('.').reverse()[0]
    filename = `${filename}.${ext}`
  }

  return {
    id: selectedCaseItem.value.report.id,
    type: 'inquiry',
    filename
  }
})

/******************************************************************************
 * Watchers & Lifecycle
 */

/**
 * When the building changes, reset the selectedIndex
 */
watch(
  () => buildingId.value, 
  () => resetListValue()
)

/**
 * Look up the addresses the buttons are named by. Only for a report with
 *  several samples on this pand: one sample needs no name.
 */
watch(
  () => samples.value,
  (list) => {
    if (list.length < 2) return
    list.forEach(sample => locationStore.loadAddressLabel(sample.address))
  },
  { immediate: true }
)

/**
 * Leave the panel if there is no data for this building
 */
useLeaveEmptyPanel(noCaseItemAvailableForBuilding, 'inquiry')

/**
 * Remarks popover
 */
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


/******************************************************************************
 * Event handlers
 */

/**
 * Navigation between cases
 */
const handleNext = function handleNext() {
  if (shownIndex.value === maxListIndex.value) return
  shownReportIndex.value = shownIndex.value + 1
}

const handlePrev = function handlePrev() {
  if (shownIndex.value < 1) return
  shownReportIndex.value = shownIndex.value - 1
}

const resetListValue = function resetListValue() {
  shownReportIndex.value = 0
}

/**
 * Open the dialog with a sample of this report: the only one, or the one of
 *  the button that was pressed
 */
const handleOpenModal = function handleOpenModal(sampleIndex = 0, label = '') {
  if (samples.value[sampleIndex]) {
    shownSampleIndex.value = sampleIndex
    shownSampleLabel.value = label
    isSamplePanelOpen.value = true
  }
}

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
    title="Onderzoeksinformatie" 
    @close="emit('close')">

    <Transition>
      <BuildingIdHeader />
    </Transition>

    <BackLink 
      @click.prevent="emit('back')"
      label="Terug naar pandinformatie" />
    
    <section
      class="content -mx-4 flex-auto space-y-10 rounded-t-lg bg-white px-4 py-6"
    >
      <div>
        <!-- Paginator -->
        <nav
          v-if="maxListIndex > 0"
          class="mb-2 flex items-center justify-between text-sm text-(--color-text-muted)">
          <button
            class="button button--link px-1 py-2.5"
            :disabled="shownIndex === 0"
            @click.prevent="handlePrev">
            <LeftArrowIcon
              class="aspect-square h-2.5"
              aria-hidden="true"
            />
            <span class="sr-only">Vorige</span>
          </button>
          <span>{{ shownIndex + 1 }} van {{ maxListIndex + 1 }}</span>
          <button
            class="button button--link px-1 py-2.5"
            :disabled="shownIndex === maxListIndex"
            @click.prevent="handleNext">
            <RightArrowIcon
              class="aspect-square h-2.5"
              aria-hidden="true"
            />
            <span class="sr-only">Volgende</span>
          </button>
        </nav>
        <h5 class="truncate" :title="selectedCaseItemTitle+''">{{ selectedCaseItemTitle }}</h5>
      </div>

      <div class="space-y-3">
        <h6 class="font-bold leading-none">Onderzoeksinformatie</h6>
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
                <span class="sr-only">Volledige opmerking tonen</span>
              </button>
            </dt>
            <dd class="break-words">
              <p 
                v-if="field.name === 'note'" 
                v-line-clamp="3"
                @clamped="handleClamped">{{ field.value }}</p>
              <span v-else>{{ field.value }}</span>
            </dd>
          </div>
        </dl>
        <template v-if="downloadDetails">
          <DocumentDownload 
            :id="downloadDetails.id" 
            :source-type="downloadDetails.type" 
            :filename="downloadDetails.filename" />
        </template>
      </div>

      <div
        v-if="sampleButtons.length"
        class="space-y-3">
        <h6 class="font-bold leading-none">Onderzoeksinformatie per adres</h6>
        <OutlineButton
          v-for="button in sampleButtons"
          :key="button.index"
          :label="button.label"
          class="w-full"
          @click.prevent="handleOpenModal(button.index, button.label)"
        />
      </div>

      <OutlineButton
        v-else
        label="Bekijk onderzoeksinformatie"
        :disabled="! hasSampleData"
        class="w-full"
        @click.prevent="handleOpenModal()"
      />
      
    </section>
  </Panel>
</template>