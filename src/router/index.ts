
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Main.vue'

// Auth
import Login from '@/views/auth/Login.vue'
import PasswordForgotten from '@/views/auth/PasswordForgotten.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

// 404
import NotFound from '@/views/NotFound.vue' 

const router = createRouter({
  history: createWebHistory(),
  routes: [

    /**************************************************************************
     * Authentication
     */
    {
      name: 'login',
      path: '/login',
      component: Login
    },
    {
      name: 'forgotten',
      path: '/forgotten',
      component: PasswordForgotten
    },
    {
      name: 'reset',
      path: '/reset/:resetKey?',
      component: ResetPassword
    },

    /**************************************************************************
     * Main Application
     */
    {
      name: 'home',
      path: '/',
      component: Home,
    },
    // openbaar/:mapsetId
    // :org/map/:mapsetId
    // :org/map/:mapsetId/gebouw/:buildingId
    {
      name: 'mapset',
      path: '/map/:mapsetId',
      component: Home,
    },
    { // Depreciated path to mapset route
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
    { // Depreciated path to building route
      path: '/map/:mapsetId/gebouw/:buildingId',
      redirect: to => {
        return { name: 'building', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId } }
      }
    },
    { // Depreciated path to building route
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
    { // Depreciated path to building-panel route
      path: '/map/:mapsetId/gebouw/:buildingId/:panel',
      redirect: to => {
        return { name: 'building-panel', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId, panel: to.params.panel } }
      }
    },
    { // Depreciated path to building-panel route
      path: '/kaart/:mapsetId/gebouw/:buildingId/:panel',
      redirect: to => {
        return { name: 'building-panel', params: { mapsetId: to.params.mapsetId, buildingId: to.params.buildingId, panel: to.params.panel } }
      }
    },
    { 
      path: '/:pathMatch(.*)*', 
      name: 'NotFound', 
      component: NotFound 
    },
  ],
})

export default router