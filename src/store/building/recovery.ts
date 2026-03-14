import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { IRecoverySample, type IRecoveryReport } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';
import { RecoveryReport } from '@/datastructures/classes/RecoveryReport';
import { RecoverySample } from '@/datastructures/classes/RecoverySample';
import { ICombinedRecoveryData } from '@/datastructures/interfaces/front-end/ICombinedRecoveryData';


function useRecoveryReports() {
  const recoveryReportsById = ref<Record<number, IRecoveryReport>>({})
  const recoverySamplesByRecoveryReportId = ref<Record<number, IRecoverySample[]>>({})
  const recoverySamplesByBuildingId = ref<Record<string, IRecoverySample[]>>({})
  const recoverySampleIdsByBuildingId = ref<Record<string, number[]>>({})
  const recoveryReportIdsByBuildingId = ref<Record<string, number[]>>({})
  const isLoadingBuildingDataById = ref<Record<string, boolean>>({})

  /**
   * Whether the recovery sample panel is open
   */
  const isSamplePanelOpen = ref(false)

  /**
   * The list index of the recovery report currently being shown
   *  This needs to match between sidebar and modal
   */
  const shownReportIndex = ref(0)

  const buildingRecoveryReportDataHasBeenRetrieved = function buildingRecoveryReportDataHasBeenRetrieved(buildingId: string): boolean {
    return Array.isArray(recoveryReportIdsByBuildingId.value[buildingId])
  }

  const buildingHasRecoveryReports = function buildingHasRecoveryReports(buildingId: string): boolean {
    return buildingRecoveryReportDataHasBeenRetrieved(buildingId) && recoveryReportIdsByBuildingId.value[buildingId].length !== 0
  }

  const getRecoveryReportByBuildingId = function getRecoveryReportByBuildingId(buildingId: string): IRecoveryReport[] {
    if (!buildingHasRecoveryReports(buildingId)) return []

    return recoveryReportIdsByBuildingId.value[buildingId]
      .filter((recoveryReportId: number) => !!recoveryReportsById.value[recoveryReportId])
      .map((recoveryReportId: number) => recoveryReportsById.value[recoveryReportId])
  }

  const getRecoverySamplesByRecoveryReportId = function getRecoverySamplesByRecoveryReportId(recoveryReportId: number): IRecoverySample[] {
    return recoverySamplesByRecoveryReportId.value[recoveryReportId]
  }

  /**
   * Get the recovery data associated to the building id
   *
   * Usually
   *  - 1 sample <=> 1 recovery &
   *  - multiple samples & recovery combinations per buildingId
   *
   * Exceptions
   *  - Multiple samples for 1 recovery
   *  - No samples for 1 recovery
   */
  const getCombinedRecoveryDataByBuildingId = function getCombinedRecoveryDataByBuildingId(buildingId: string): ICombinedRecoveryData[] {
    const sampleIdsForBuilding = recoverySampleIdsByBuildingId.value[buildingId] || []
    const combinedData: ICombinedRecoveryData[] = []

    getRecoveryReportByBuildingId(buildingId)
      .forEach((report: IRecoveryReport) => {
        const samples = getRecoverySamplesByRecoveryReportId(report.id)
          .filter(sample => sampleIdsForBuilding.includes(sample.id))

        if (samples.length === 0) {
          combinedData.push({ report, sample: undefined })
        } else {
          samples.forEach(sample => {
            combinedData.push({ report, sample })
          })
        }
      })

    return combinedData
  }

  const setRecoveryDataByBuildingId = function setRecoveryDataByBuildingId(buildingId: string, reports: IRecoveryReport[], samples: IRecoverySample[]) {
    reports.forEach((report: IRecoveryReport) => {
      recoveryReportsById.value[report.id] = new RecoveryReport(report)
    })

    recoveryReportIdsByBuildingId.value[buildingId] = reports.map((report: IRecoveryReport) => report.id)

    samples.forEach((sample: IRecoverySample) => {
      sample = new RecoverySample(sample)
      const reportId = sample.recovery
      recoverySamplesByRecoveryReportId.value[reportId] = recoverySamplesByRecoveryReportId.value[reportId] || []

      if (!recoverySamplesByRecoveryReportId.value[reportId].some(s => s.id === sample.id)) {
        recoverySamplesByRecoveryReportId.value[reportId].push(sample)
      }

      recoverySamplesByBuildingId.value[buildingId] = recoverySamplesByBuildingId.value[buildingId] || []
      recoverySamplesByBuildingId.value[buildingId].push(sample)

      recoverySampleIdsByBuildingId.value[buildingId] = recoverySampleIdsByBuildingId.value[buildingId] || []
      recoverySampleIdsByBuildingId.value[buildingId].push(sample.id)
    })
  }

  const loadRecoveryReportDataByBuildingId = async function loadRecoveryReportDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) return
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingRecoveryReportDataHasBeenRetrieved(buildingId)) {
        return
      }

      const response: IRecoveryReport[] = await api.building.getRecoveryReportsByBuildingId(buildingId)

      response.forEach((recoveryReport: IRecoveryReport) => {
        recoveryReportsById.value[recoveryReport.id] = new RecoveryReport(recoveryReport)
      })

      recoveryReportIdsByBuildingId.value[buildingId] = response.map((report: IRecoveryReport) => report.id)

      const sampleResults = await Promise.allSettled(
        response.map(report => api.building.getRecoverySamplesByRecoveryId(report.id))
      )
      sampleResults.forEach((result, index) => {
        if (result.status !== 'fulfilled') return
        const recoveryReportId = response[index].id
        recoverySamplesByRecoveryReportId.value[recoveryReportId] = result.value.map(
          (sample: IRecoverySample) => new RecoverySample(sample)
        )
      })

    } catch (e) {
      console.error("Failed to load recovery data", buildingId, e)
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearRecoveryReportData = function clearRecoveryReportData() {
    recoveryReportIdsByBuildingId.value = {}
    recoveryReportsById.value = {}
    recoverySamplesByRecoveryReportId.value = {}
    recoverySamplesByBuildingId.value = {}
    recoverySampleIdsByBuildingId.value = {}
    isLoadingBuildingDataById.value = {}
  }

  /**
   * Clean up recoveryReport data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearRecoveryReportData()
      }
    }
  )

  return {
    buildingRecoveryReportDataHasBeenRetrieved,
    buildingHasRecoveryReports,
    getRecoveryReportByBuildingId,

    getRecoverySamplesByRecoveryReportId,

    loadRecoveryReportDataByBuildingId,
    setRecoveryDataByBuildingId,

    getCombinedRecoveryDataByBuildingId,

    isSamplePanelOpen,
    shownReportIndex
  }
}


export const useRecoveryReportsStore = defineStore(
  'recoveryReports',
  useRecoveryReports
)
