import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Main.vue'
import { getSession, LOGIN_HOST, onLoginHost, safeRedirect } from '@/services/auth'

/**
 * The login page forwards someone who is logged in already, but a tab only once a minute: when the map then finds
 * no session after all (a call answering 401 while the session check said yes), forwarding again would bounce them
 * between the two for ever. Within the minute they get the form, as before. (FunderMapsAuth's rule, moved along.)
 */
const FORWARDED_KEY = 'fundermaps-login:forwarded'
const FORWARD_AGAIN_AFTER_MS = 60_000

function forwardOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(FORWARDED_KEY) ?? 0)
    if (Date.now() - last < FORWARD_AGAIN_AFTER_MS) return false
    sessionStorage.setItem(FORWARDED_KEY, String(Date.now()))
    return true
  } catch {
    // No storage, so no way to notice a bounce: the form.
    return false
  }
}

/** The login form does not wait on a slow API: no answer within a few seconds counts as "no session". */
const SESSION_WAIT_MS = 4000
const sessionInTime = () => Promise.race([getSession(), new Promise<null>((resolve) => setTimeout(resolve, SESSION_WAIT_MS, null))])

const router = createRouter({
  history: createWebHistory(),
  routes: [

    /**************************************************************************
     * Authentication
     */
    // The map's own login pages (moved from FunderMapsAuth, 2026-10-29). The paths are the old login app's, so
    // auth.fundermaps.com can forward here path for path (bookmarks, reset mails still in an inbox).
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/auth/Login.vue'),
      // Someone logged in already is not asked again: on to where they were going, else the map. Not when the
      // account page sent them here because the API wants a new login (`expired`).
      beforeEnter: async (to) => {
        if (to.query.expired === '1' || !(await sessionInTime()) || !forwardOnce()) return true
        const redirect = Array.isArray(to.query.redirect) ? to.query.redirect[0] : to.query.redirect
        // replace, not assign: Back must not land on this page again.
        window.location.replace(safeRedirect(redirect) ?? `${window.location.origin}/`)
        return false
      },
    },
    { name: 'forgot-password', path: '/forgot-password', component: () => import('@/views/auth/ForgotPassword.vue') },
    { name: 'reset-password', path: '/reset-password', component: () => import('@/views/auth/ResetPassword.vue') },
    {
      name: 'account',
      path: '/account',
      component: () => import('@/views/auth/Account.vue'),
      beforeEnter: async () => ((await getSession()) ? true : { name: 'login', query: { redirect: '/account' } }),
    },
    // The map's older password pages (before the login app): to the new ones. An old reset key cannot be used any
    // more, so that visitor asks for a new link.
    { path: '/forgotten', redirect: { name: 'forgot-password' } },
    { path: '/reset/:resetKey?', redirect: { name: 'forgot-password' } },

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
    case 'mapset':
      // The map names itself (views/Main.vue): this hook also runs on every
      // map move, which keeps the position in the query string.
      break
    case 'NotFound':
      document.title = `Pagina niet gevonden — ${BASE_TITLE}`
      break
    default:
      document.title = BASE_TITLE
  }
})

/** The login pages work on a fundermaps.com host only (the cookie's); elsewhere, the same page there. */
const LOGIN_PAGES = new Set(['login', 'forgot-password', 'reset-password', 'account'])
router.beforeEach((to) => {
  if (!LOGIN_PAGES.has(String(to.name)) || onLoginHost()) return true
  window.location.replace(`${LOGIN_HOST}${to.fullPath}`)
  return false
})

export default router
