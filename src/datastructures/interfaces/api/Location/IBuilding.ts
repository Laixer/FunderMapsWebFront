import { IGeoLocationModel } from "./IGeoLocationModel";

export interface IBuilding extends IGeoLocationModel {
  builtYear?: string, // DateTime
  active: boolean,
  neighborhoodId?: string,
  // Building footprint centroid (EPSG:4326). Used to pan the map / drop a
  // marker when a building is opened from a BAG-number search — the geocoder
  // no longer returns building coordinates anywhere else, and the residence
  // point is null for most buildings.
  latitude?: number,
  longitude?: number
}