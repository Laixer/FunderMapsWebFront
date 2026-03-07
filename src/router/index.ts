import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Main.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    /**************************************************************************
     * Authentication
     */
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      name: 'forgotten',
      path: '/forgotten',
      component: () => import('@/views/auth/PasswordForgotten.vue')
    },
    {
      name: 'reset',
      path: '/reset/:resetKey?',
      component: () => import('@/views/auth/ResetPassword.vue')
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
    case 'forgotten':
      document.title = `Wachtwoord vergeten — ${BASE_TITLE}`
      break
    case 'reset':
      document.title = `Wachtwoord herstellen — ${BASE_TITLE}`
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
