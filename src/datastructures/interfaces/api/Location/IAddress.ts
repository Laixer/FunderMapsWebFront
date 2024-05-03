import { IGeoLocationModel } from "./IGeoLocationModel";

export interface IAddress extends IGeoLocationModel {
  buildingNumber: string,
  postalCode?: string,
  street: string,
  isActive: boolean,
  city: string,
  buildingId?: string,
  fullAddress: string
}