import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useBuildingStore } from '@/store/buildings'
import { useStatisticsStore } from '@/store/building/statistics'
import { useInquiriesStore } from '@/store/building/inquiries'
import { useRecoveryReportsStore } from '@/store/building/recovery'
import { useIncidentReportsStore } from '@/store/building/incidents'

interface BaseMenuItem {
  slug: string
  name: string
  loading: boolean
  disabled: boolean
}

export interface BuildingMenuItem extends BaseMenuItem {
  icon: string
  panel: string
}

// Report menu items render as buttons without an icon and always route
// to a panel.
export interface ReportMenuItem extends BaseMenuItem {
  panel: string
}

// Action menu items render as buttons and run a one-shot callback
// (e.g. opening a modal) instead of routing to a panel.
export interface ActionMenuItem extends BaseMenuItem {
  action: () => void
}

export function useBuildingMenu() {
  const { buildingId } = storeToRefs(useBuildingStore())
  const statisticsStore = useStatisticsStore()
  const inquiriesStore = useInquiriesStore()
  const recoveryStore = useRecoveryReportsStore()
  const incidentsStore = useIncidentReportsStore()

  const buildingMenu = computed<BuildingMenuItem[]>(() => [
    { slug: 'building', panel: 'BuildingPanel', icon: 'building', name: 'Pand',
      loading: false, disabled: false },
    { slug: 'location', panel: 'LocationPanel', icon: 'pin', name: 'Locatie',
      loading: false, disabled: false },
    { slug: 'foundation', panel: 'FoundationPanel', icon: 'file-foundation', name: 'Fundering',
      loading: false, disabled: false },
    { slug: 'foundation-risk', panel: 'FoundationRiskPanel', icon: 'alert', name: 'Funderingsrisico',
      loading: false, disabled: false },
  ])

  const actionMenu = computed<ActionMenuItem[]>(() => [
    { slug: 'statistics', name: 'Bekijk statistieken',
      loading: false,
      disabled: !!(buildingId.value && statisticsStore.failedToLoad(buildingId.value)),
      action: () => { statisticsStore.showStatisticsModal = true } },
  ])

  const reportMenu = computed<ReportMenuItem[]>(() => [
    { slug: 'inquiry', panel: 'InquiryPanel',
      name: 'Bekijk onderzoeks informatie',
      loading: !!(buildingId.value && !inquiriesStore.hasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !inquiriesStore.hasReports(buildingId.value)) },
    { slug: 'recovery', panel: 'RecoveryPanel',
      name: 'Bekijk herstel informatie',
      loading: !!(buildingId.value && !recoveryStore.hasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !recoveryStore.hasReports(buildingId.value)) },
    { slug: 'incidents', panel: 'IncidentsPanel',
      name: 'Bekijk incidenten',
      loading: !!(buildingId.value && !incidentsStore.buildingIncidentReportDataHasBeenRetrieved(buildingId.value)),
      disabled: !!(buildingId.value && !incidentsStore.buildingHasIncidentReports(buildingId.value)) },
  ])

  return { buildingMenu, actionMenu, reportMenu }
}
