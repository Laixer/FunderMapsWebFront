import type { IAttributionControl } from '@/datastructures/interfaces/api/Controls'
import { TypedRecord } from '../TypedRecord'

export interface AttributionControl extends IAttributionControl {}

export class AttributionControl extends TypedRecord {
  className = 'AttributionControl'

  constructor(data: IAttributionControl) {
    super()
    Object.assign(this, data)
  }

  /**
   * Who processed the record, as shown to a user: the organisation, never a
   * person. creatorName and reviewerName are e-mail addresses of people and
   * are not put on screen. Null when there is no organisation name, or when
   * what is in it is an e-mail address after all.
   */
  get processedByName(): string | null {
    const name = (this.ownerName ?? '').trim()
    return name && ! name.includes('@') ? name : null
  }
}
