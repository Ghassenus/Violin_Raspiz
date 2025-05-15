// router.js
import { createRouter, createWebHashHistory } from 'https://unpkg.com/vue-router@4/dist/vue-router.esm-browser.js'

import Dashboard from './pages/Dashboard.vue'
import Settings from './pages/Settings.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/settings', component: Settings, name: 'Settings' }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
