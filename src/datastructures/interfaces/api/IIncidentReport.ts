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
  meta: object,
  /**
   * 'melding': one of the meldingen the incident map layer draws. It has a
   * topic and nothing else to show (no melder, no date, no number); every
   * other field above is empty on it.
   */
  kind?: 'incident' | 'melding',
  topic?: string
}