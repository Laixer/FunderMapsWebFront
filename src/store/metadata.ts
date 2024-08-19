

/**
 * Meta data
 * 
 *  Implemented based on the (local)Storage API 
 *    https://developer.mozilla.org/en-US/docs/Web/API/Storage
 * 
 * Meta data to be stored at API
 *  administative-boundaries
 *  ownership-filter
 * 
 *  lastCenterPosition
 *  lastZoomLevel
 *  lastPitchDegree
 *  lastRotation
 */


import { type Ref, ref } from "vue";
import { defineStore, storeToRefs } from "pinia";
import api from "@/services/api";

import { useSessionStore } from '@/store/session';

import { useDebounceFn } from "@vueuse/core";

/**
 * Meta data store
 *  TODO: Improve typing (any...)
 */
const metadata: Ref<Record<string, any>> = ref({}) 

/**
 * 
 */
const isAvailable = ref(false) 



function useMetadata() {

  // TODO: maybe no ref necessary ?
  const sessionStore = useSessionStore()
  const { isAuthenticated } = storeToRefs(sessionStore)

  /**
   * Retrieve from / store at API
   */
  const retrieve = async function retrieve() {
    try {
      if (! isAuthenticated.value) {
        isAvailable.value = true
        return
      }

      const response = await api.metadata.getMetadata()
      
      console.log("RETRIEVE", JSON.parse(JSON.stringify(response)))

      if (response) {
        metadata.value = response || {}
      }

      console.log(metadata)
      isAvailable.value = true;

    } catch(e) {
      isAvailable.value = true;
    }
  }

  const store = useDebounceFn(
    async function store() {
      if (isAuthenticated.value) {
        await api.metadata.setMetadata(metadata.value)
      }
  }, 500)

  const getItem = function getMetaDataItem(name: string) {
    if (! isAuthenticated.value) {
      const value = localStorage.getItem(name)
      if (value) {
        try {
          return JSON.parse(value)
        } catch(err) {
          return value
        }
      }
      return value
    } else {
      return metadata.value[name] || undefined
    }
  }
  
  /**
   * localStorage.setItem only accepts string. 
   */
  const setItem = function setItem(name: string, value: any) {
    if (! isAuthenticated.value) {
      if (typeof value !== 'string') {
        value = JSON.stringify(value)
      }
      return localStorage.setItem(name, value)
    } else {
      metadata.value[name] = value
      store() // fire & forget
    }
  }
  
  const removeItem = function remove(name: string) {
    if (! isAuthenticated.value) {
      localStorage.removeItem(name)
    } else {
      delete metadata.value[name]
      store() // fire & forget
    }
  }
  
  const clear = function clear() {
    localStorage.clear()
    metadata.value = {}
    store() // fire & forget
  }

  return {
    isAvailable,

    // storage methods
    getItem,
    setItem,
    removeItem,
    clear,

    // API methods
    retrieve,
    store
  }
}

export const useMetadataStore = defineStore(
  'metadata',
  useMetadata
)



