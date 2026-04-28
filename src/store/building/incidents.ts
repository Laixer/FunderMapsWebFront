import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type IIncidentReport } from "@/datastructures/interfaces"
import { useSessionStore } from '../session';
import { IncidentReport } from '@/datastructures/classes/IncidentReport';


function useIncidentReports() {
  const incidentReportsById = ref<Record<string, IIncidentReport>>({})
  const incidentReportIdsByBuildingId = ref<Record<string, string[]>>({})

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

  const clearIncidentReportData = function clearIncidentReportData() {
    incidentReportIdsByBuildingId.value = {}
    incidentReportsById.value = {}
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
    setIncidentDataByBuildingId,
  }
}


export const useIncidentReportsStore = defineStore(
  'incidentReports',
  useIncidentReports
)
