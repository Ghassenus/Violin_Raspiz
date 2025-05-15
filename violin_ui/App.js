import Dashboard from './pages/Dashboard.js'
import Settings from './pages/Settings.js'

export default {
  name: 'App',
  template: `
    <div>
      <nav class="navbar">
        <a href="#/" :class="{active: $route.path === '/'}">🏠 Dashboard</a>
        <a href="#/settings" :class="{active: $route.path === '/settings'}">⚙️ Réglages</a>
      </nav>
      <router-view />
    </div>
  `,
  components: {
    Dashboard,
    Settings
  }
}
