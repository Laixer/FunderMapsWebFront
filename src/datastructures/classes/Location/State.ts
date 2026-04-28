import type { IState } from '@/datastructures/interfaces'
import { TypedRecord } from '../TypedRecord'

export interface State extends IState {}

export class State extends TypedRecord {
  className = 'State'

  constructor(data: IState) {
    super()
    Object.assign(this, data)
  }
}
