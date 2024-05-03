import { IEnumMethods } from "../util";

export interface IAttributionControl extends IEnumMethods {
  id: number,
  reviewer: string, // uuid
  creator: string, // uuid
  owner: string, // uuid
  contractor: string // uuid
}