import {
  EReliabilityLabels,
  ERecoveryTypeLabels,
  EFoundationDamageCauseLabels,
  EEnforcementTermLabels,
  EFoundationQualityLabels,
  EInquiryTypeLabels,
  EFoundationTypeLabels,
  EFoundationRiskLabels,
} from '../enums'
import { ESoilLabels } from '../enums/ESoil'
import type { IAnalysis } from '../interfaces'
import { TypedRecord } from './TypedRecord'

// Declaration merging: gives Analysis instances every IAnalysis field
// without redeclaring them on the class. Object.assign in the constructor
// populates them at runtime.
export interface Analysis extends IAnalysis {}

export class Analysis extends TypedRecord {
  className = 'Analysis'
  protected enumLabels = {
    constructionYearReliability: EReliabilityLabels,
    recoveryType: ERecoveryTypeLabels,
    damageCause: EFoundationDamageCauseLabels,
    enforcementTerm: EEnforcementTermLabels,
    overallQuality: EFoundationQualityLabels,
    inquiryType: EInquiryTypeLabels,
    foundationType: EFoundationTypeLabels,
    foundationTypeReliability: EReliabilityLabels,
    drystandReliability: EReliabilityLabels,
    drystandRisk: EFoundationRiskLabels,
    dewateringDepthReliability: EReliabilityLabels,
    dewateringDepthRisk: EFoundationRiskLabels,
    bioInfectionReliability: EReliabilityLabels,
    bioInfectionRisk: EFoundationRiskLabels,
    unclassifiedRisk: EFoundationRiskLabels,
    soil: ESoilLabels,
  }

  constructor(data: IAnalysis) {
    super()
    Object.assign(this, data)
  }
}
