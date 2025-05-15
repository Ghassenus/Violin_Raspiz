import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import App from './App.js'
import { router } from './router.js'

createApp(App).use(router).mount('#app')
