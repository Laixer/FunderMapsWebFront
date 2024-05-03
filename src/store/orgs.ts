
import { Ref, computed, ref } from 'vue';
import { defineStore } from 'pinia'
import { IOrg } from '@/datastructures/interfaces';
import api from '@/services/api';


/******************************************************************************
 * Store data
 */
const isLoadingOrgs: Ref<boolean> = ref(false)

const availableOrgs: Ref<IOrg[]> = ref([])

const selectedOrgId: Ref<string|null> = ref(null)

/******************************************************************************
 * Getters
 */
const hasAvailableOrgs: Ref<boolean> = computed(() => {
  return availableOrgs.value.length !== 0
})

const hasSelectedOrg: Ref<boolean> = computed(() => {
  return selectedOrgId.value !== null
})

const getOrgById = function getOrgById(id: string): IOrg|null {
  if (! hasAvailableOrgs.value) return null

  return availableOrgs.value.find( (org: IOrg) => {
    return org.id === id
  }) || null
}

const selectedOrg: Ref<IOrg|null> = computed(() => {
  if (! hasSelectedOrg.value) return null
  return getOrgById(selectedOrgId.value as string)
})

/******************************************************************************
 * Mutating the store data
 */

const selectOrgById = function(id: string) {
  if (getOrgById(id) !== null) {
    selectedOrgId.value = id
  }
}

/**
 * This only happens when the user logs in / session is restored
 */
const loadAvailableOrgs = async function() {
  isLoadingOrgs.value = true

  try {
    const orgs = await api.org.getOrgs()

    availableOrgs.value = orgs
    if(hasAvailableOrgs.value) {
      selectOrgById(availableOrgs.value[0].id)
    }

  } catch(e) {
    console.log(e)

    throw e
  }

  isLoadingOrgs.value = false
}

/**
 * Clean up - used on logout
 */
const removeOrgs = function() {
  availableOrgs.value = []
  selectedOrgId.value = null
}

function useOrgs() {
  return {

    // Get info
    availableOrgs,
    hasAvailableOrgs,
    selectedOrgId,
    selectedOrg,
    hasSelectedOrg,
    getOrgById,

    // Mutations
    selectOrgById,
    loadAvailableOrgs,
    removeOrgs
  }
}


export const useOrgsStore = defineStore(
  'orgs',
  useOrgs
)