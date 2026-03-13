import { defineStore } from 'pinia'

import { type IAnalysis } from "@/datastructures/interfaces"
import api from '@/services/api'
import { createBuildingDataLoader } from './createBuildingDataLoader'


export const useAnalysisStore = defineStore('analysis', () => {
  const { hasBeenRetrieved, failedToLoad, hasData, getData, loadData } =
    createBuildingDataLoader<IAnalysis>('analysis', api.building.getAnalysisByBuildingId)

  return { hasBeenRetrieved, failedToLoad, hasData, getData, loadData }
})
