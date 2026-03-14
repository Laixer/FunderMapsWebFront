import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia'

import { type ICombinedInquiryData, type IInquirySample, type IInquiryReport } from "@/datastructures/interfaces"
import api from '@/services/api';
import { useSessionStore } from '../session';
import { InquirySample } from '@/datastructures/classes/InquirySample';
import { Inquiry } from '@/datastructures/classes/Inquiry';


function useInquiries() {
  const inquiriesById = ref<Record<number, IInquiryReport>>({})
  const inquirySamplesByInquiryId = ref<Record<number, IInquirySample[]>>({})
  const inquirySamplesByBuildingId = ref<Record<string, IInquirySample[]>>({})
  const inquirySampleIdsByBuildingId = ref<Record<string, number[]>>({})
  const inquiryIdsByBuildingId = ref<Record<string, number[]>>({})
  const isLoadingBuildingDataById = ref<Record<string, boolean>>({})

  /**
   * Whether the inquiry sample panel is open
   */
  const isSamplePanelOpen = ref(false)

  /**
   * The list index of the inquiry report currently being shown
   *  This needs to match between sidebar and modal
   */
  const shownReportIndex = ref(0)

  const buildingInquiryDataHasBeenRetrieved = function buildingInquiryDataHasBeenRetrieved(buildingId: string): boolean {
    return Array.isArray(inquiryIdsByBuildingId.value[buildingId])
  }

  const buildingHasInquiries = function buildingHasInquiries(buildingId: string): boolean {
    return buildingInquiryDataHasBeenRetrieved(buildingId) && inquiryIdsByBuildingId.value[buildingId].length !== 0
  }

  const getInquiryByBuildingId = function getInquiryByBuildingId(buildingId: string): IInquiryReport[] {
    if (! buildingHasInquiries(buildingId)) return []

    return inquiryIdsByBuildingId.value[buildingId]
      .filter(( inquiryId: number ) => !! inquiriesById.value[inquiryId])
      .map(( inquiryId: number ) => inquiriesById.value[inquiryId])
  }

  const getInquirySamplesByInquiryId = function getInquirySamplesByInquiryId(inquiryId: number) {
    return inquirySamplesByInquiryId.value[inquiryId]
  }

  /**
   * Get the inquiry data associated to the building id
   *
   * Usually
   *  - 1 sample <=> 1 inquiry &
   *  - multiple samples & inquiry combinations per buildingId
   *
   * Exceptions
   *  - Multiple samples for 1 inquiry
   *  - No samples for 1 inquiry
   */
  const getCombinedInquiryDataByBuildingId = function getCombinedInquiryDataByBuildingId(buildingId: string): ICombinedInquiryData[] {
    const sampleIdsForBuilding = inquirySampleIdsByBuildingId.value[buildingId] || []
    const combinedData: ICombinedInquiryData[] = []

    getInquiryByBuildingId(buildingId)
      .forEach((report: IInquiryReport) => {
        const samples = getInquirySamplesByInquiryId(report.id)
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

  const setInquiryDataByBuildingId = function setInquiryDataByBuildingId(buildingId: string, reports: IInquiryReport[], samples: IInquirySample[]) {
    reports.forEach((inquiry: IInquiryReport) => {
      inquiriesById.value[inquiry.id] = new Inquiry(inquiry)
    })

    inquiryIdsByBuildingId.value[buildingId] = reports.map((report: IInquiryReport) => report.id)

    samples.forEach((sample: IInquirySample) => {
      sample = new InquirySample(sample)
      const reportId = sample.inquiry
      inquirySamplesByInquiryId.value[reportId] = inquirySamplesByInquiryId.value[reportId] || []

      if (! inquirySamplesByInquiryId.value[reportId].some(s => s.id === sample.id)) {
        inquirySamplesByInquiryId.value[reportId].push(sample)
      }

      inquirySamplesByBuildingId.value[buildingId] = inquirySamplesByBuildingId.value[buildingId] || []
      inquirySamplesByBuildingId.value[buildingId].push(sample)

      inquirySampleIdsByBuildingId.value[buildingId] = inquirySampleIdsByBuildingId.value[buildingId] || []
      inquirySampleIdsByBuildingId.value[buildingId].push(sample.id)
    })
  }

  const loadInquiryDataByBuildingId = async function loadInquiryDataByBuildingId(buildingId: string, cache: boolean = true) {
    try {
      if (isLoadingBuildingDataById.value[buildingId] === true) return
      isLoadingBuildingDataById.value[buildingId] = true

      if (cache === true && buildingInquiryDataHasBeenRetrieved(buildingId)) {
        return
      }

      const reports: IInquiryReport[] = await api.building.getInquiriesByBuildingId(buildingId)

      const sampleResults = await Promise.allSettled(
        reports.map(report => api.building.getInquirySamplesByInquiryId(report.id))
      )
      const samples = sampleResults
        .filter((r): r is PromiseFulfilledResult<IInquirySample[]> => r.status === 'fulfilled')
        .flatMap(r => r.value)

      setInquiryDataByBuildingId(buildingId, reports, samples)
    } catch(e) {
      console.error("Failed to load inquiry data", buildingId, e)
    }

    isLoadingBuildingDataById.value[buildingId] = false
  }

  const clearInquiryData = function clearInquiryData() {
    inquiryIdsByBuildingId.value = {}
    inquiriesById.value = {}
    inquirySamplesByInquiryId.value = {}
    inquirySamplesByBuildingId.value = {}
    inquirySampleIdsByBuildingId.value = {}
    isLoadingBuildingDataById.value = {}
  }

  /**
   * Clean up inquiry data on logout
   */
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(
    isAuthenticated,
    (value) => {
      if (value !== true) {
        clearInquiryData()
      }
    }
  )

  return {
    buildingInquiryDataHasBeenRetrieved,
    buildingHasInquiries,
    getInquiryByBuildingId,

    getInquirySamplesByInquiryId,

    loadInquiryDataByBuildingId,
    setInquiryDataByBuildingId,

    getCombinedInquiryDataByBuildingId,

    isSamplePanelOpen,
    shownReportIndex
  }
}


export const useInquiriesStore = defineStore(
  'inquiries',
  useInquiries
)
