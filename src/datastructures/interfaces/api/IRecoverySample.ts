import { EFacade, EPileType, ERecoveryStatus, ERecoveryType } from "@/datastructures/enums";
import { IEnumMethods } from "./util";


export interface IRecoverySample extends IEnumMethods {
  identifier: number,
  id: number,
  recovery: number,
  note?: string,
  building: string,
  status?: ERecoveryStatus,
  type: ERecoveryType,
  pileType?: EPileType,
  contractor?: number,
  facade?: EFacade[],
  permit?: string,
  permitDate?: string, // DateTime
  recoveryDate?: string // DateTime
}
