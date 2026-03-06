import { type Ref, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type IIncidentReport } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';
import { IncidentReport } from '@/datastructures/classes/IncidentReport';


function useIncidentReports() {
  const incidentReportsById: Ref<Record<string, IIncidentReport>> = ref({})
  const incidentReportIdsByBuildingId: Ref<Record<string, string[]>> = ref({})
  const isLoadingBuildingDataById: Ref<Record<string, boolean>> = ref({})

  const buildingIncidentReportDataHasBeenRetrieved = function buildingIncidentReportDataHasBeenRetrieved(buildingId: string): boolean {
    return Array.isArray(incidentReportIdsByBuildingId.value[buildingId])
  }

  const buildingHasIncidentReports = function buildingHasIncidentReports(buildingId: string): boolean {
    return buildingIncidentReportDataHasBeenRetrieved(buildingId) && incidentReportIdsByBuildingId.value[buildingId].length !== 0
  }

  const getIncidentReportsByBuildingId = function getIncidentReportsByBuildingId(buildingId: string): IIncidentReport[] {
    if (! buildingHasIncidentReports(buildingId)) return []

    return incidentReportIdsByBuildingId.value[buildingId]
      .filter(( incidentReportId: string ) => !! incidentReportsById.value[incidentReportId])
      .map(( incidentReportId: string ) => incidentReportsById.value[incidentReportId])
  }

  const setIncidentDataByBuildingId = function setIncidentDataByBuildingId(buildingId: string, reports: IIncidentReport[]) {
    reports.forEach((incidentReport: IIncidentReport) => {
      incidentReportsById.value[incidentReport.id] = new IncidentReport(incidentReport)
    })

    incidentReportIdsByBuildingId.value[buildingId] = reports.map((incident: IIncidentReport) => incident.id)
  }

  const loadIncidentReportDataByBuildingId = async function loadIncidentReportDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) return
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingIncidentReportDataHasBeenRetrieved(buildingId)) {
        return
      }

      const response: IIncidentReport[] = await api.building.getIncidentReportsByBuildingId(buildingId)
      setIncidentDataByBuildingId(buildingId, response)

    } catch(e) {
      console.error("Failed to load incident data", buildingId, e)
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearIncidentReportData = function clearIncidentReportData() {
    incidentReportIdsByBuildingId.value = {}
    incidentReportsById.value = {}
    isLoadingBuildingDataById.value = {}
  }

  /**
   * Clean up incidentReport data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearIncidentReportData()
      }
    }
  )

  return {
    buildingIncidentReportDataHasBeenRetrieved,
    buildingHasIncidentReports,
    getIncidentReportsByBuildingId,

    loadIncidentReportDataByBuildingId,
    setIncidentDataByBuildingId
  }
}


export const useIncidentReportsStore = defineStore(
  'incidentReports',
  useIncidentReports
)
