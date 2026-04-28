import { defineStore } from 'pinia'

import type { IRecoverySample, IRecoveryReport } from '@/datastructures/interfaces'
import { RecoveryReport } from '@/datastructures/classes/RecoveryReport'
import { RecoverySample } from '@/datastructures/classes/RecoverySample'
import { createReportStore } from './createReportStore'

export const useRecoveryReportsStore = defineStore('recoveryReports', () => {
  return createReportStore<IRecoveryReport, IRecoverySample>({
    ReportClass: RecoveryReport,
    SampleClass: RecoverySample,
    parentKey: 'recovery',
  })
})
