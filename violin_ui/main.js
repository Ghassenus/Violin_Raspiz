import App from './App.js'
import { getCurrentRouteComponent } from './router.js'

const app = Vue.createApp(App)
app.component('CurrentPage', getCurrentRouteComponent())
app.mount('#app')

window.addEventListener('hashchange', () => {
  const route = getCurrentRouteComponent()
  app.component('CurrentPage', route)
})
