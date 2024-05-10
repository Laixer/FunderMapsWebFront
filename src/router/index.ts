
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Main.vue'

// Auth
import Login from '@/views/auth/Login.vue'
import PasswordForgotten from '@/views/auth/PasswordForgotten.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

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
    // :org/kaart/:mapsetId
    // :org/kaart/:mapsetId/gebouw/:buildingId
    {
      name: 'mapset',
      path: '/kaart/:mapsetId',
      component: Home,
    },
    {
      name: 'building',
      path: '/kaart/:mapsetId/gebouw/:buildingId',
      component: Home,
    },
    {
      name: 'building-panel',
      path: '/kaart/:mapsetId/gebouw/:buildingId/:panel',
      component: Home
    }
  ],
})



export default router