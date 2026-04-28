import {
  EFoundationTypeLabels,
  EFoundationDamageCauseLabels,
  EAuditStatusLabels,
  EIncidentQuestionTypeLabels,
  EFoundationDamageCharacteristicsLabels,
  EEnvironmentDamageCharacteristicsLabels,
} from '../enums'
import type { IIncidentReport } from '../interfaces'
import { TypedRecord } from './TypedRecord'

export interface IncidentReport extends IIncidentReport {}

export class IncidentReport extends TypedRecord {
  className = 'IncidentReport'
  protected enumLabels = {
    foundationType: EFoundationTypeLabels,
    foundationDamageCause: EFoundationDamageCauseLabels,
    foundationDamageCharacteristics: EFoundationDamageCharacteristicsLabels,
    environmentDamageCharacteristics: EEnvironmentDamageCharacteristicsLabels,
    auditStatus: EAuditStatusLabels,
    incidentQuestionType: EIncidentQuestionTypeLabels,
  }

  constructor(data: IIncidentReport) {
    super()
    Object.assign(this, data)
  }
}
