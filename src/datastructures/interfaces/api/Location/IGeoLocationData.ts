import { IBuilding, IAddress, INeighborhood, IDistrict, IMunicipality, IState } from "../..";
import { IEnumMethods } from "../util";

export interface IGeoLocationData extends IEnumMethods {
  building: IBuilding,
  address: IAddress,
  neighborhood: null | INeighborhood,
  district: null | IDistrict,
  municipality: null | IMunicipality,
  state: null | IState
}