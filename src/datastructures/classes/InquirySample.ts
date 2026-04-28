import {
  EFoundationQualityLabels,
  EWoodQualityLabels,
  EQualityLabels,
  ECrackTypeLabels,
  ERotationTypeLabels,
  ESubstructureLabels,
  EFoundationTypeLabels,
  EConstructionPileLabels,
  EEnforcementTermLabels,
  EFoundationDamageCauseLabels,
  EFoundationDamageCharacteristicsLabels,
  EWoodEncroachementLabels,
  EWoodTypeLabels,
} from '../enums'
import type { IInquirySample } from '../interfaces'
import { TypedRecord } from './TypedRecord'

export interface InquirySample extends IInquirySample {}

export class InquirySample extends TypedRecord {
  className = 'InquirySample'
  protected enumLabels = {
    substructure: ESubstructureLabels,
    foundationType: EFoundationTypeLabels,
    enforcementTerm: EEnforcementTermLabels,
    damageCause: EFoundationDamageCauseLabels,
    damageCharacteristics: EFoundationDamageCharacteristicsLabels,
    constructionPile: EConstructionPileLabels,
    woodType: EWoodTypeLabels,
    woodEncroachement: EWoodEncroachementLabels,
    overallQuality: EFoundationQualityLabels,
    woodQuality: EWoodQualityLabels,
    constructionQuality: EQualityLabels,
    woodCapacityHorizontalQuality: EQualityLabels,
    pileWoodCapacityVerticalQuality: EQualityLabels,
    carryingCapacityQuality: EQualityLabels,
    masonQuality: EQualityLabels,
    crackIndoorType: ECrackTypeLabels,
    crackFacadeFrontType: ECrackTypeLabels,
    crackFacadeBackType: ECrackTypeLabels,
    crackFacadeLeftType: ECrackTypeLabels,
    crackFacadeRightType: ECrackTypeLabels,
    skewedParallelFacade: ERotationTypeLabels,
    skewedPerpendicularFacade: ERotationTypeLabels,
  }

  constructor(data: IInquirySample) {
    super()
    Object.assign(this, data)
  }
}
