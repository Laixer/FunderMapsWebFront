import { defineStore } from 'pinia'

import type { IInquirySample, IInquiryReport } from '@/datastructures/interfaces'
import { Inquiry } from '@/datastructures/classes/Inquiry'
import { InquirySample } from '@/datastructures/classes/InquirySample'
import { createReportStore } from './createReportStore'

export const useInquiriesStore = defineStore('inquiries', () => {
  return createReportStore<IInquiryReport, IInquirySample>({
    ReportClass: Inquiry,
    SampleClass: InquirySample,
    parentKey: 'inquiry',
  })
})
