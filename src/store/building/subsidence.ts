import { defineStore } from 'pinia'

import { type ISubsidence } from "@/datastructures/interfaces"
import api from '@/services/api'
import { createBuildingDataLoader } from './createBuildingDataLoader'


export const useSubsidenceStore = defineStore('subsidence', () => {
  const { hasBeenRetrieved, failedToLoad, hasData, getData, loadData } =
    createBuildingDataLoader<ISubsidence[]>('subsidence', api.building.getSubsidenceByBuildingId)

  return { hasBeenRetrieved, failedToLoad, hasData, getData, loadData }
})
