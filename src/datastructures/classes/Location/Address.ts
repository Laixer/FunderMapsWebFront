import type { IAddress } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface Address extends IAddress {}

export class Address extends TypedRecord {
  className = 'Address'

  constructor(data: IAddress) {
    super()
    Object.assign(this, data)
  }
}
