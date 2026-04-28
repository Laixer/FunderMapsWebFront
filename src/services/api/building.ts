import type {
  IGeoLocationData,
  IAnalysis,
  IStatistics,
  IDownloadLink,
  ICombinedReportData,
  ISubsidence,
} from "@/datastructures/interfaces"
import { get } from "../apiClient"
import { Analysis } from "@/datastructures/classes/Analysis"
import {
  adaptAnalysis,
  adaptStatistics,
  adaptGeoLocationData,
  adaptCombinedReport,
  adaptSubsidence,
} from "./_adapters"

export const getLocationInformationByBuildingId = async (buildingId: string): Promise<IGeoLocationData> => {
  const raw = await get({ endpoint: `/geocoder/building-info/${buildingId}` })
  return adaptGeoLocationData(raw)
}

export const getAnalysisByBuildingId = async (buildingId: string): Promise<IAnalysis> => {
  const raw = await get({ endpoint: `/product/${buildingId}/analysis` })
  return new Analysis(adaptAnalysis(raw))
}

export const getStatisticsByBuildingId = async (buildingId: string): Promise<IStatistics> => {
  const raw = await get({ endpoint: `/product/${buildingId}/statistics` })
  return adaptStatistics(raw)
}

export const getAllReportDataByBuildingId = async (buildingId: string): Promise<ICombinedReportData> => {
  const raw = await get({ endpoint: `/report/${buildingId}` })
  return adaptCombinedReport(raw)
}

export const getSubsidenceByBuildingId = async (buildingId: string): Promise<ISubsidence[]> => {
  const rows = await get({ endpoint: `/product/${buildingId}/subsidence/historic` })
  return adaptSubsidence(rows)
}

export const getRecoveryReportDownloadLink = async (recoveryId: string): Promise<IDownloadLink> =>
  await get({ endpoint: `/recovery/${recoveryId}/download` }) as IDownloadLink

export const getInquiryReportDownloadLink = async (inquiryId: string): Promise<IDownloadLink> =>
  await get({ endpoint: `/inquiry/${inquiryId}/download` }) as IDownloadLink

export default {
  getLocationInformationByBuildingId,
  getAnalysisByBuildingId,
  getStatisticsByBuildingId,
  getAllReportDataByBuildingId,
  getSubsidenceByBuildingId,
  getRecoveryReportDownloadLink,
  getInquiryReportDownloadLink,
}

