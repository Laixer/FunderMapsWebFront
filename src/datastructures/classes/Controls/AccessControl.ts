import { EAccessPolicyLabels } from '@/datastructures/enums'
import type { IAccessControl } from '@/datastructures/interfaces/api/Controls'
import { TypedRecord } from '../TypedRecord'

export interface AccessControl extends IAccessControl {}

export class AccessControl extends TypedRecord {
  className = 'AccessControl'
  protected enumLabels = { accessPolicy: EAccessPolicyLabels }

  constructor(data: IAccessControl) {
    super()
    Object.assign(this, data)
  }
}
