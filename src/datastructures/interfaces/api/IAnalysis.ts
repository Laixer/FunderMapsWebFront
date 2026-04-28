import {
  EEnforcementTerm,
  EFoundationDamageCause,
  EFoundationQuality,
  EFoundationRisk,
  EFoundationType,
  EInquiryType,
  ERecoveryType,
  EReliability
} from "@/datastructures/enums";
import { IEnumMethods } from "./util";
import { ESoil } from "@/datastructures/enums/ESoil";

export interface IAnalysis extends IEnumMethods {
  buildingId: string,
  externalBuildingId: string,
  addressId: string,
  externalAddressId: string,
  neighborhoodId: string,
  constructionYear?: number,
  constructionYearReliability: EReliability,
  recoveryType?: ERecoveryType,
  restorationCosts?: number,
  height?: number,
  velocity?: number,
  groundWaterLevel?: number,
  groundLevel?: number,
  soil?: ESoil,
  surfaceArea?: number,
  damageCause?: EFoundationDamageCause,
  enforcementTerm?: EEnforcementTerm,
  overallQuality?: EFoundationQuality,
  inquiryType?: EInquiryType,
  foundationType?: EFoundationType,
  foundationTypeReliability?: EReliability,
  drystand?: number,
  drystandReliability: EReliability,
  drystandRisk?: EFoundationRisk,
  dewateringDepth?: number,
  dewateringDepthReliability: EReliability,
  dewateringDepthRisk?: EFoundationRisk,
  bioInfectionReliability: EReliability,
  bioInfectionRisk?: EFoundationRisk,
  unclassifiedRisk?: EFoundationRisk
}