// router.js (nouvelle version compatible avec .js components)
import { createRouter, createWebHashHistory } from 'https://unpkg.com/vue-router@4/dist/vue-router.esm-browser.js'

import Dashboard from './pages/Dashboard.js'
import Settings from './pages/Settings.js'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/settings', component: Settings, name: 'Settings' }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
