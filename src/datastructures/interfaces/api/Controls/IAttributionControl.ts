import { IEnumMethods } from "../util";

export interface IAttributionControl extends IEnumMethods {
  id: number,
  reviewer: string, // uuid
  reviewerName: string
  creator: string, // uuid
  creatorName: string
  owner: string, // uuid
  ownerName: string
  dataOwner: string, // uuid — org that owns the data (#973)
  dataOwnerName: string
  contractor: string // uuid
  contractorName: string
}