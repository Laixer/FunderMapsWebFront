
import {
  EAuditStatus
} from '../../../enums'
import { IEnumMethods } from '../util'

export interface IStateControl extends IEnumMethods {
  auditStatus: EAuditStatus,
  allowWrite: boolean,
}