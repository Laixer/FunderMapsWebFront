import { ERecoveryDocumentTypeLabels } from '../enums'
import type { IRecoveryReport } from '../interfaces'
import { AccessControl, AttributionControl, RecordControl, StateControl } from './Controls'
import { TypedRecord } from './TypedRecord'

export interface RecoveryReport extends IRecoveryReport {}

export class RecoveryReport extends TypedRecord {
  className = 'RecoveryReport'
  protected enumLabels = { type: ERecoveryDocumentTypeLabels }

  constructor(data: IRecoveryReport) {
    super()
    Object.assign(this, data)
    this.attribution = new AttributionControl(data.attribution)
    this.state = new StateControl(data.state)
    this.access = new AccessControl(data.access)
    this.record = new RecordControl(data.record)
  }
}
