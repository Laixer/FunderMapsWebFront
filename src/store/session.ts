
import { computed, type ShallowRef, shallowRef } from 'vue';
import { defineStore} from 'pinia'

import type { IUser } from '@/datastructures/interfaces'
import api from '@/services/api'
import { hasNonExpiredToken, getClaimFromAccessToken, removeAccessToken, storeAccessToken } from '@/services/jwt';

import { useMapsetStore } from '@/store/mapsets'
import { useOrgsStore } from '@/store/orgs'

/**
 * Holds the basic information of the logged in user
 *  It does _not_ contain the user profile information
 */
const currentUser: ShallowRef<IUser|null> = shallowRef(null)

/**
 * If we have user info, we can consider the user authenticated
 */
const isAuthenticated = computed<boolean>(() => {
  return currentUser.value !== null
})


/**
 * Retrieve the user name from the access token
 */
function setUserNameFromToken() {
  const username = getClaimFromAccessToken(
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
  )

  if(username) {
    currentUser.value = {
      name: username.toString()
    }
  } else {
    // TODO: What if we got a user with no name? 
    currentUser.value = {
      name: 'Anoniem'
    }
  }
}


/**
 * 
 */
function useSession() {

  // Try to continue from the access token in the localstorage
  // Note: this is called from App.vue setup, so no async available
  function authenticateFromAccessToken() {
    if (hasNonExpiredToken()) {
      setUserNameFromToken()
    } else {
      // Clean up 
      logout()
    }
  }

  /**
   * 
   * @param email 
   * @param password 
   */
  async function login(email: string, password: string) {
    try {
      const response = await api.auth.login(email, password)
      storeAccessToken(response.token)
      setUserNameFromToken()

    } catch(e) {
      console.log(e)

      try {
        // clean up a partial success if need be
        logout()
      } catch(e) {}

      throw e // pass on the unhappy news
    }
  }
  
  // TODO: Attach automated data cleanup 
  function logout() {

    console.log("LOGOUT")

    const { 
      removePrivateMapsets
    } = useMapsetStore()

    const {
      removeOrgs
    } = useOrgsStore()

    removeAccessToken()

    // remove profile info - effect of unloading component
    // remove non-public mapset info
    // remove orgs info
    removePrivateMapsets()
    removeOrgs()

    currentUser.value = null
  }

  return {
    currentUser,
    authenticateFromAccessToken,
    isAuthenticated,
    login,
    logout
  }
}

export const useSessionStore = defineStore(
  'session',
  useSession,
)