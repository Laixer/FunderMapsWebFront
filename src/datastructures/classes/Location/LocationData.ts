import type { IGeoLocationData } from '@/datastructures/interfaces'
import { Address } from './Address'
import { Building } from './Building'
import { District } from './District'
import { Municipality } from './Municipality'
import { Neighborhood } from './Neighborhood'
import { Residence } from './Residence'
import { State } from './State'
import { TypedRecord } from '../TypedRecord'

export interface GeoLocationData extends IGeoLocationData {}

export class GeoLocationData extends TypedRecord {
  className = 'LocationData'

  constructor(data: IGeoLocationData) {
    super()
    this.building = new Building(data.building)
    this.address = new Address(data.address)
    this.neighborhood = data.neighborhood ? new Neighborhood(data.neighborhood) : null
    this.residence = data.residence ? new Residence(data.residence) : null
    this.district = data.district ? new District(data.district) : null
    this.municipality = data.municipality ? new Municipality(data.municipality) : null
    this.state = data.state ? new State(data.state) : null
  }
}
