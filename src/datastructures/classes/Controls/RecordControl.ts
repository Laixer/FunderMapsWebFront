import type { IRecordControl } from '@/datastructures/interfaces/api/Controls'
import { TypedRecord } from '../TypedRecord'

export interface RecordControl extends IRecordControl {}

export class RecordControl extends TypedRecord {
  className = 'RecordControl'

  constructor(data: IRecordControl) {
    super()
    Object.assign(this, data)
  }
}
