import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useBuildingStore } from '@/store/buildings'
import { useStatisticsStore } from '@/store/building/statistics'
import { useInquiriesStore } from '@/store/building/inquiries'
import { useRecoveryReportsStore } from '@/store/building/recovery'
import { useIncidentReportsStore } from '@/store/building/incidents'

interface BaseMenuItem {
  slug: string
  panel: string
  name: string
  loading: boolean
  disabled: boolean
  route: null
}

export interface BuildingMenuItem extends BaseMenuItem {
  icon: string
}

// Report menu items render as buttons without an icon.
export type ReportMenuItem = BaseMenuItem

// Menu lists rendered in the building sidebar's main view. Split into the
// "always visible" core panels and the "may be empty" report panels —
// which separately track per-building loading/disabled state.
export function useBuildingMenu() {
  const { buildingId } = storeToRefs(useBuildingStore())
  const statisticsStore = useStatisticsStore()
  const inquiriesStore = useInquiriesStore()
  const recoveryStore = useRecoveryReportsStore()
  const incidentsStore = useIncidentReportsStore()

  const buildingMenu = computed<BuildingMenuItem[]>(() => [
    { slug: 'building', panel: 'BuildingPanel', icon: 'building', name: 'Pand',
      loading: false, disabled: false, route: null },
    { slug: 'location', panel: 'LocationPanel', icon: 'pin', name: 'Locatie',
      loading: false, disabled: false, route: null },
    { slug: 'foundation', panel: 'FoundationPanel', icon: 'file-foundation', name: 'Fundering',
      loading: false, disabled: false, route: null },
    { slug: 'statistics', panel: 'StatisticsPanel', icon: 'graph', name: 'Statistiek',
      loading: false,
      disabled: !!(buildingId.value && statisticsStore.failedToLoad(buildingId.value)),
      route: null },
    { slug: 'foundation-risk', panel: 'FoundationRiskPanel', icon: 'alert', name: 'Funderingsrisico',
      loading: false, disabled: false, route: null },
  ])

  const reportMenu = computed<ReportMenuItem[]>(() => [
    { slug: 'inquiry', panel: 'InquiryPanel',
      name: 'Bekijk onderzoeks informatie',
      loading: !!(buildingId.value && !inquiriesStore.hasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !inquiriesStore.hasReports(buildingId.value)),
      route: null },
    { slug: 'recovery', panel: 'RecoveryPanel',
      name: 'Bekijk herstel informatie',
      loading: !!(buildingId.value && !recoveryStore.hasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !recoveryStore.hasReports(buildingId.value)),
      route: null },
    { slug: 'incidents', panel: 'IncidentsPanel',
      name: 'Bekijk incidenten',
      loading: !!(buildingId.value && !incidentsStore.buildingIncidentReportDataHasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !incidentsStore.buildingHasIncidentReports(buildingId.value)),
      route: null },
  ])

  return { buildingMenu, reportMenu }
}
