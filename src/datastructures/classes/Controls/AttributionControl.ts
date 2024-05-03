import { IAttributionControl } from "@/datastructures/interfaces/api/Controls";
import { EnumMethods } from "../EnumMethods";

export class AttributionControl extends EnumMethods implements IAttributionControl {
  id: number;
  reviewer: string;
  creator: string;
  owner: string;
  contractor: string;

  className = 'AttributionControl'

  constructor(data: IAttributionControl) {
    super()
    
    this.id = data.id;
    this.reviewer = data.reviewer;
    this.creator = data.creator;
    this.owner = data.owner;
    this.contractor = data.contractor;
  }
}