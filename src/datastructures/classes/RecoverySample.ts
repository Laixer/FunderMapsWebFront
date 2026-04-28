import {
  ERecoveryStatusLabels,
  ERecoveryTypeLabels,
  EPileTypeLabels,
  EFacadeLabels,
} from '../enums'
import type { IRecoverySample } from '../interfaces'
import { TypedRecord } from './TypedRecord'

export interface RecoverySample extends IRecoverySample {}

export class RecoverySample extends TypedRecord {
  className = 'RecoverySample'
  protected enumLabels = {
    status: ERecoveryStatusLabels,
    type: ERecoveryTypeLabels,
    pileType: EPileTypeLabels,
    facade: EFacadeLabels,
  }

  constructor(data: IRecoverySample) {
    super()
    Object.assign(this, data)
  }
}
