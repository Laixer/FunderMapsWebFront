import { EAuditStatusLabels } from '@/datastructures/enums'
import type { IStateControl } from '@/datastructures/interfaces/api/Controls'
import { TypedRecord } from '../TypedRecord'

export interface StateControl extends IStateControl {}

export class StateControl extends TypedRecord {
  className = 'StateControl'
  protected enumLabels = { auditStatus: EAuditStatusLabels }

  constructor(data: IStateControl) {
    super()
    Object.assign(this, data)
  }
}
