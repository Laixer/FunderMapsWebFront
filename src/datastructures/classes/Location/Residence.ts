import type { IResidence } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface Residence extends IResidence {}

export class Residence extends TypedRecord {
  className = 'Residence'

  constructor(data: IResidence) {
    super()
    Object.assign(this, data)
  }
}
