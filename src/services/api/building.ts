import type {
  IGeoLocationData,
  IIncidentReport,
  IInquiryReport,
  IRecoveryReport,
  IAnalysis,
  IStatistics,
  IRecoverySample,
  IDownloadLink,
  IInquirySample,
  ICombinedReportData,
  ISubsidence
} from "@/datastructures/interfaces"
import { get } from "../apiClient"
import { Analysis } from "@/datastructures/classes/Analysis"
import {
  adaptAnalysis,
  adaptStatistics,
  adaptGeoLocationData,
  adaptIncident,
  adaptRecovery,
  adaptCombinedReport,
  adaptRecoverySample,
} from "./_adapters"

export const getLocationInformationByBuildingId = async (buildingId: string): Promise<IGeoLocationData> => {
  const raw = await get({ endpoint: `/geocoder/building-info/${buildingId}` })
  return adaptGeoLocationData(raw) as unknown as IGeoLocationData
}

export const getAnalysisByBuildingId = async (buildingId: string): Promise<IAnalysis> => {
  const raw = await get({ endpoint: `/product/${buildingId}/analysis` })
  return new Analysis(adaptAnalysis(raw) as unknown as IAnalysis)
}

export const getRecoveryReportsByBuildingId = async (buildingId: string): Promise<IRecoveryReport[]> => {
  const rows = await get({ endpoint: `/recovery/building/${buildingId}` })
  return (rows as Record<string, unknown>[]).map(adaptRecovery) as unknown as IRecoveryReport[]
}

export const getRecoverySamplesByRecoveryId = async (recoveryId: string | number): Promise<IRecoverySample[]> => {
  const rows = await get({ endpoint: `/recovery/${recoveryId}/sample` })
  return (rows as Record<string, unknown>[]).map(adaptRecoverySample) as unknown as IRecoverySample[]
}

export const getRecoveryReportDownloadLink = async (recoveryId: string): Promise<IDownloadLink> => {
  return await get({ endpoint: `/recovery/${recoveryId}/download` }) as IDownloadLink
}

export const getInquiriesByBuildingId = async (buildingId: string): Promise<IInquiryReport[]> => {
  // /api/inquiry/building/:id already returns C#-shape (LegacyInquiry: camelCase
  // + integer enums + nested attribution/state/access/record). No adapter needed.
  return await get({ endpoint: `/inquiry/building/${buildingId}` }) as IInquiryReport[]
}

export const getInquirySamplesByInquiryId = async (inquiryId: string | number): Promise<IInquirySample[]> => {
  // Same: /api/inquiry/:id/sample returns LegacyInquirySample (camelCase).
  return await get({ endpoint: `/inquiry/${inquiryId}/sample` }) as IInquirySample[]
}

export const getInquiryReportDownloadLink = async (inquiryId: string): Promise<IDownloadLink> => {
  return await get({ endpoint: `/inquiry/${inquiryId}/download` }) as IDownloadLink
}

export const getStatisticsByBuildingId = async (buildingId: string): Promise<IStatistics> => {
  const raw = await get({ endpoint: `/product/${buildingId}/statistics` })
  return adaptStatistics(raw as never) as unknown as IStatistics
}

export const getIncidentReportsByBuildingId = async (buildingId: string): Promise<IIncidentReport[]> => {
  const rows = await get({ endpoint: `/incident/building/${buildingId}` })
  return (rows as Record<string, unknown>[]).map(adaptIncident) as unknown as IIncidentReport[]
}

export const getAllReportDataByBuildingId = async (buildingId: string): Promise<ICombinedReportData> => {
  const raw = await get({ endpoint: `/report/${buildingId}` })
  return adaptCombinedReport(raw as never) as unknown as ICombinedReportData
}

export const getSubsidenceByBuildingId = async (buildingId: string): Promise<ISubsidence[]> => {
  const rows = await get({ endpoint: `/product/${buildingId}/subsidence/historic` })
  return (rows as { velocity: number | string; mark_at: string }[]).map((r) => ({
    velocity: Number(r.velocity),
    markAt: r.mark_at,
  }))
}

export default {
  getLocationInformationByBuildingId,
  getAnalysisByBuildingId,
  getRecoveryReportsByBuildingId,
  getRecoverySamplesByRecoveryId,
  getRecoveryReportDownloadLink,
  getInquiriesByBuildingId,
  getInquirySamplesByInquiryId,
  getInquiryReportDownloadLink,
  getStatisticsByBuildingId,
  getIncidentReportsByBuildingId,
  getAllReportDataByBuildingId,
  getSubsidenceByBuildingId
}
