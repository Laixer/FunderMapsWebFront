import type { INeighborhood } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface Neighborhood extends INeighborhood {}

export class Neighborhood extends TypedRecord {
  className = 'Neighborhood'

  constructor(data: INeighborhood) {
    super()
    Object.assign(this, data)
  }
}
