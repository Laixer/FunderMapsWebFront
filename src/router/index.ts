import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Main.vue'
import { forgotPasswordRedirect, loginRedirect } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    /**************************************************************************
     * Authentication
     */
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      // Login lives in the auth app (auth.fundermaps.com). Navigate there
      // before the component renders; come back to the map afterwards.
      beforeEnter: () => {
        loginRedirect(window.location.origin + '/')
        return false
      },
    },
    // The map's own password pages are gone: resetting a password happens in
    // the auth app. Old bookmarks and old reset links are sent there; an old
    // reset key cannot be used any more, so that visitor asks for a new link.
    {
      name: 'forgotten',
      path: '/forgotten',
      component: () => import('@/views/auth/Login.vue'),
      beforeEnter: () => {
        forgotPasswordRedirect()
        return false
      },
    },
    {
      name: 'reset',
      path: '/reset/:resetKey?',
      component: () => import('@/views/auth/Login.vue'),
      beforeEnter: () => {
        forgotPasswordRedirect()
        return false
      },
    },

    /**************************************************************************
     * Main Application
     */
    {
      name: 'home',
      path: '/',
      component: Home,
    },
    {
      name: 'mapset',
      path: '/map/:mapsetId',
      component: Home,
    },
    { // Legacy path redirect
      path: '/kaart/:mapsetId',
      redirect: to => {
        return { name: 'mapset', params: { mapsetId: to.params.mapsetId } }
      }
    },
    {
      name: 'building',
      path: '/map/:mapsetId/building/:buildingId',
      component: Home,
    },
    { // Legacy path redirect
      path: '/map/:mapsetId/gebouw/:buildingId',
      redirect: to => {
        return { name: 'building', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId } }
      }
    },
    { // Legacy path redirect
      path: '/kaart/:mapsetId/gebouw/:buildingId',
      redirect: to => {
        return { name: 'building', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId } }
      }
    },
    {
      name: 'building-panel',
      path: '/map/:mapsetId/building/:buildingId/:panel',
      component: Home
    },
    { // Legacy path redirect
      path: '/map/:mapsetId/gebouw/:buildingId/:panel',
      redirect: to => {
        return { name: 'building-panel', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId, panel: to.params.panel } }
      }
    },
    { // Legacy path redirect
      path: '/kaart/:mapsetId/gebouw/:buildingId/:panel',
      redirect: to => {
        return { name: 'building-panel', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId, panel: to.params.panel } }
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    },
  ],
})

const BASE_TITLE = 'FunderMaps'

router.afterEach((to) => {
  switch (to.name) {
    case 'login':
      document.title = `Inloggen — ${BASE_TITLE}`
      break
    case 'building':
    case 'building-panel':
      document.title = `Pand ${to.params.buildingId} — ${BASE_TITLE}`
      break
    case 'mapset':
      document.title = BASE_TITLE
      break
    default:
      document.title = BASE_TITLE
  }
})

export default router
