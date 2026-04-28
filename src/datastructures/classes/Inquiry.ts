import { EInquiryTypeLabels } from '../enums'
import type { IInquiryReport } from '../interfaces'
import { AccessControl, AttributionControl, RecordControl, StateControl } from './Controls'
import { TypedRecord } from './TypedRecord'

export interface Inquiry extends IInquiryReport {}

export class Inquiry extends TypedRecord {
  className = 'Inquiry'
  protected enumLabels = { type: EInquiryTypeLabels }

  constructor(data: IInquiryReport) {
    super()
    Object.assign(this, data)
    // Wrap nested envelopes so fieldData's source.getClassName() lookup
    // resolves to AttributionControl / StateControl / etc.
    this.attribution = new AttributionControl(data.attribution)
    this.state = new StateControl(data.state)
    this.access = new AccessControl(data.access)
    this.record = new RecordControl(data.record)
  }
}
