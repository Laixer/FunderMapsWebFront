import type { IDistrict } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface District extends IDistrict {}

export class District extends TypedRecord {
  className = 'District'

  constructor(data: IDistrict) {
    super()
    Object.assign(this, data)
  }
}
