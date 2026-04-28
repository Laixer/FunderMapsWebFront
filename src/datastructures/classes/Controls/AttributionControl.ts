import type { IAttributionControl } from '@/datastructures/interfaces/api/Controls'
import { TypedRecord } from '../TypedRecord'

export interface AttributionControl extends IAttributionControl {}

export class AttributionControl extends TypedRecord {
  className = 'AttributionControl'

  constructor(data: IAttributionControl) {
    super()
    Object.assign(this, data)
  }
}
