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

export const getLocationInformationByBuildingId = async (buildingId: string): Promise<IGeoLocationData> => {
  return await get({ endpoint: `/geocoder/${buildingId}` })
}

export const getAnalysisByBuildingId = async (buildingId: string): Promise<IAnalysis> => {
  const response = await get({ endpoint: `/product/analysis/${buildingId}` })
  return new Analysis(response)
}

export const getRecoveryReportsByBuildingId = async (buildingId: string): Promise<IRecoveryReport[]> => {
  return await get({ endpoint: `/recovery/building/${buildingId}` })
}

export const getRecoverySamplesByRecoveryId = async (recoveryId: string | number): Promise<IRecoverySample[]> => {
  return await get({ endpoint: `/recovery/${recoveryId}/sample` })
}

export const getRecoveryReportDownloadLink = async (recoveryId: string): Promise<IDownloadLink> => {
  return await get({ endpoint: `/recovery/${recoveryId}/download` })
}

export const getInquiriesByBuildingId = async (buildingId: string): Promise<IInquiryReport[]> => {
  return await get({ endpoint: `/inquiry/building/${buildingId}` })
}

export const getInquirySamplesByInquiryId = async (inquiryId: string | number): Promise<IInquirySample[]> => {
  return await get({ endpoint: `/inquiry/${inquiryId}/sample` })
}

export const getInquiryReportDownloadLink = async (inquiryId: string): Promise<IDownloadLink> => {
  return await get({ endpoint: `/inquiry/${inquiryId}/download` })
}

export const getStatisticsByBuildingId = async (buildingId: string): Promise<IStatistics> => {
  return await get({ endpoint: `/product/statistics/building/${buildingId}` })
}

export const getIncidentReportsByBuildingId = async (buildingId: string): Promise<IIncidentReport[]> => {
  return await get({ endpoint: `/incident/building/${buildingId}` })
}

export const getAllReportDataByBuildingId = async (buildingId: string): Promise<ICombinedReportData> => {
  return await get({ endpoint: `/report/${buildingId}` })
}

export const getSubsidenceByBuildingId = async (buildingId: string): Promise<ISubsidence[]> => {
  return await get({ endpoint: `/subsidence/${buildingId}` })
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