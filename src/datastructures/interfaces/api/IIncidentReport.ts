import {
  EAuditStatus,
  EFoundationType,
  EFoundationDamageCause,
  EFoundationDamageCharacteristics,
  EEnvironmentDamageCharacteristics,
  EIncidentQuestionType
} from '../../enums/index'
import { IEnumMethods } from './util'

export interface IIncidentReport extends IEnumMethods {
  id: string,
  clientId?: string,
  clientName: string,
  foundationType?: EFoundationType,
  chainedBuilding: boolean,
  owner: boolean,
  foundationRecovery: boolean,
  neighborRecovery: boolean,
  foundationDamageCause: EFoundationDamageCause,
  documentFile?: string[],
  note?: string,
  internalNote?: string,
  foundationDamageCharacteristics: EFoundationDamageCharacteristics[],
  environmentDamageCharacteristics: EEnvironmentDamageCharacteristics[],
  email: string,
  name?: string,
  phoneNumber?: string,
  address?: string,
  building: string,
  auditStatus: EAuditStatus,
  incidentQuestionType: EIncidentQuestionType,
  meta: object
}