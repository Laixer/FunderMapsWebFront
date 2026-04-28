import type { IMunicipality } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface Municipality extends IMunicipality {}

export class Municipality extends TypedRecord {
  className = 'Municipality'

  constructor(data: IMunicipality) {
    super()
    Object.assign(this, data)
  }
}
