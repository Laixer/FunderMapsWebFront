import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSessionStore } from '../session'

interface ReportLike { id: number }
interface SampleLike { id: number }

export interface CombinedReportSample<R, S> {
  report: R
  sample: S | undefined
}

// Shared scaffolding for inquiry and recovery stores: report-with-samples
// shape, building→reports index, sample-panel UI state, logout cleanup.
//
// Must be called inside a Pinia defineStore setup function.
export function createReportStore<R extends ReportLike, S extends SampleLike>(options: {
  ReportClass: new (data: R) => R
  SampleClass: new (data: S) => S
  // Field on a sample that points back to its parent report id
  // (e.g. 'inquiry' for InquirySample, 'recovery' for RecoverySample).
  parentKey: keyof S
}) {
  const { ReportClass, SampleClass, parentKey } = options

  const reportsById = ref<Record<number, R>>({})
  const samplesByReportId = ref<Record<number, S[]>>({})
  const reportIdsByBuildingId = ref<Record<string, number[]>>({})
  const sampleIdsByBuildingId = ref<Record<string, number[]>>({})

  // Sample-panel UI state, used by the sidebar/modal pair.
  const isSamplePanelOpen = ref(false)
  const shownReportIndex = ref(0)

  function hasBeenRetrieved(buildingId: string): boolean {
    return Array.isArray(reportIdsByBuildingId.value[buildingId])
  }

  function hasReports(buildingId: string): boolean {
    return hasBeenRetrieved(buildingId) && reportIdsByBuildingId.value[buildingId].length !== 0
  }

  function getReports(buildingId: string): R[] {
    if (!hasReports(buildingId)) return []
    return reportIdsByBuildingId.value[buildingId]
      .filter(id => !!reportsById.value[id])
      .map(id => reportsById.value[id])
  }

  function getSamplesByReportId(reportId: number): S[] {
    return samplesByReportId.value[reportId] ?? []
  }

  // Cross-product of reports × samples scoped to this building. A report
  // with no samples still appears once with sample=undefined.
  function getCombined(buildingId: string): CombinedReportSample<R, S>[] {
    const sampleIdsForBuilding = sampleIdsByBuildingId.value[buildingId] ?? []
    const out: CombinedReportSample<R, S>[] = []

    for (const report of getReports(buildingId)) {
      const samples = getSamplesByReportId(report.id)
        .filter(s => sampleIdsForBuilding.includes(s.id))

      if (samples.length === 0) {
        out.push({ report, sample: undefined })
      } else {
        for (const sample of samples) out.push({ report, sample })
      }
    }
    return out
  }

  function setData(buildingId: string, reports: R[], samples: S[]): void {
    for (const r of reports) reportsById.value[r.id] = new ReportClass(r)
    reportIdsByBuildingId.value[buildingId] = reports.map(r => r.id)

    for (const raw of samples) {
      const sample = new SampleClass(raw)
      const reportId = sample[parentKey] as unknown as number
      const bucket = (samplesByReportId.value[reportId] ??= [])
      if (!bucket.some(existing => existing.id === sample.id)) bucket.push(sample)

      ;(sampleIdsByBuildingId.value[buildingId] ??= []).push(sample.id)
    }
  }

  function clear(): void {
    reportsById.value = {}
    samplesByReportId.value = {}
    reportIdsByBuildingId.value = {}
    sampleIdsByBuildingId.value = {}
  }

  // Drop everything on logout so a re-login can't see the previous user's data.
  const { isAuthenticated } = storeToRefs(useSessionStore())
  watch(isAuthenticated, value => { if (value !== true) clear() })

  return {
    hasBeenRetrieved,
    hasReports,
    getReports,
    getSamplesByReportId,
    getCombined,
    setData,
    clear,
    isSamplePanelOpen,
    shownReportIndex,
  }
}
