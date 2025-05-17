//App.js
import Dashboard from './pages/Dashboard.js'
import Wifi from './pages/Wifi.js'
import Bluetooth from './pages/Bluetooth.js'
import Audio from './pages/Audio.js'
import Settings from './pages/Settings.js'

const routes = {
  "#/": Dashboard,
  "#/wifi": Wifi,
  "#/bluetooth": Bluetooth,
  "#/audio": Audio,
  "#/settings": Settings
};

export default {
  name: "App",
  data() {
    return {
      route: location.hash || "#/",
    };
  },
  computed: {
    currentView() {
      return routes[this.route] || Dashboard;
    }
  },
  created() {
    window.addEventListener("hashchange", () => {
      this.route = location.hash || "#/";
    });
  },
  template: `
    <div>
      <nav class="navbar">
        <a href="#/" :class="{active: route === '#/'}">🏠 Dashboard</a>
        <a href="#/wifi" :class="{active: route === '#/wifi'}">📶 Wi-Fi</a>
        <a href="#/bluetooth" :class="{active: route === '#/bluetooth'}">🟦 Bluetooth</a>
        <a href="#/audio" :class="{active: route === '#/audio'}">🎵 Audio</a>
        <a href="#/settings" :class="{active: route === '#/settings'}">⚙️ Réglages</a>
      </nav>

      <component :is="currentView" />

      <hr />
      <div class="terminal">
        <h4>🖥️ Console WebSocket</h4>
        <div id="terminal_log" class="log-console"></div>
      </div>
    </div>
  `
}
