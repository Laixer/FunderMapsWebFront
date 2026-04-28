import type { IBuilding } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface Building extends IBuilding {}

export class Building extends TypedRecord {
  className = 'Building'

  constructor(data: IBuilding) {
    super()
    Object.assign(this, data)
  }
}
