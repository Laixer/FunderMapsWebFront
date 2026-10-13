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

/**
 * Street and number of one address (a BAG nummeraanduiding id), or null when
 * the answer has no street. The geocoder is public: no session is needed, and
 * a 401 here must never send the user to the login.
 */
export const getAddressLabelById = async (addressId: string): Promise<string | null> => {
  const raw = await get({ endpoint: `/geocoder/address/${addressId}`, requireAuth: false }) as
    { street?: string | null, building_number?: string | null } | null

  if (! raw?.street) return null
  return `${raw.street} ${raw.building_number ?? ''}`.trim()
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
  getAddressLabelById,
  getAnalysisByBuildingId,
  getStatisticsByBuildingId,
  getAllReportDataByBuildingId,
  getSubsidenceByBuildingId,
  getRecoveryReportDownloadLink,
  getInquiryReportDownloadLink,
}

