/**
 * Composable that loads all building data when the selected building changes.
 * Provides derived loading/error state from the building stores.
 */
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useBuildingStore } from '@/store/buildings'
import { useGeoLocationsStore } from '@/store/building/geolocations'
import { useAnalysisStore } from '@/store/building/analysis'
import { useStatisticsStore } from '@/store/building/statistics'
import { useSubsidenceStore } from '@/store/building/subsidence'
import { useRecoveryReportsStore } from '@/store/building/recovery'
import { useInquiriesStore } from '@/store/building/inquiries'
import { useIncidentReportsStore } from '@/store/building/incidents'

import api from '@/services/api'


export function useBuildingData() {
  const { buildingId } = storeToRefs(useBuildingStore())

  const locationStore = useGeoLocationsStore()
  const analysisStore = useAnalysisStore()
  const statisticsStore = useStatisticsStore()
  const subsidenceStore = useSubsidenceStore()

  const {
    buildingRecoveryReportDataHasBeenRetrieved,
    buildingHasRecoveryReports,
    setRecoveryDataByBuildingId
  } = useRecoveryReportsStore()

  const {
    buildingInquiryDataHasBeenRetrieved,
    buildingHasInquiries,
    setInquiryDataByBuildingId
  } = useInquiriesStore()

  const {
    buildingIncidentReportDataHasBeenRetrieved,
    buildingHasIncidentReports,
    setIncidentDataByBuildingId
  } = useIncidentReportsStore()

  /**
   * Without either location or analysis data there are too many gaps to present the building information
   */
  const failedToLoad = computed(() => {
    if (buildingId.value) {
      return locationStore.failedToLoad(buildingId.value)
        || analysisStore.failedToLoad(buildingId.value)
    }
    return false
  })

  /**
   * Core data is still being loaded
   */
  const isLoadingCoreData = computed(() => {
    if (! buildingId.value) return false
    return ! locationStore.hasBeenRetrieved(buildingId.value)
      || ! analysisStore.hasBeenRetrieved(buildingId.value)
  })

  /**
   * Load all report data (recovery, inquiries, incidents) unless already cached
   */
  async function loadReportData(buildingId: string) {
    if (
      ! buildingRecoveryReportDataHasBeenRetrieved(buildingId) ||
      ! buildingIncidentReportDataHasBeenRetrieved(buildingId) ||
      ! buildingInquiryDataHasBeenRetrieved(buildingId)
    ) {
      const response = await api.building.getAllReportDataByBuildingId(buildingId)

      if (! buildingRecoveryReportDataHasBeenRetrieved(buildingId)) {
        setRecoveryDataByBuildingId(buildingId, response.recoveries, response.recoverySamples)
      }
      if (! buildingInquiryDataHasBeenRetrieved(buildingId)) {
        setInquiryDataByBuildingId(buildingId, response.inquiries, response.inquirySamples)
      }
      if (! buildingIncidentReportDataHasBeenRetrieved(buildingId)) {
        setIncidentDataByBuildingId(buildingId, response.incidents)
      }
    }
  }

  /**
   * When the selected building changes, load all data in parallel.
   * Uses Promise.allSettled so one failed API call doesn't block the others.
   * Returns a callback so the component can react to the loading start.
   */
  function startWatching(onBuildingSelected: () => void) {
    watch(
      () => buildingId.value,
      async (id) => {
        if (id === null) return

        onBuildingSelected()

        await Promise.allSettled([
          locationStore.loadData(id),
          analysisStore.loadData(id),
          statisticsStore.loadData(id),
          subsidenceStore.loadData(id),
          loadReportData(id)
        ])
      },
      { immediate: true }
    )
  }

  return {
    failedToLoad,
    isLoadingCoreData,

    // Store accessors for menu state
    statisticsStore,
    buildingRecoveryReportDataHasBeenRetrieved,
    buildingHasRecoveryReports,
    buildingInquiryDataHasBeenRetrieved,
    buildingHasInquiries,
    buildingIncidentReportDataHasBeenRetrieved,
    buildingHasIncidentReports,

    startWatching,
  }
}
