// main.js
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { router } from './router.js'

import App from './App.vue'

const app = createApp(App)
app.use(router)
app.mount('#app')
