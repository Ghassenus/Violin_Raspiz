import Dashboard from './pages/Dashboard.js'
import WifiPage from './pages/WifiPage.js'
import BluetoothPage from './pages/BluetoothPage.js'
import AudioPage from './pages/AudioPage.js'
import SettingsPage from './pages/SettingsPage.js'

const routes = {
  '/': Dashboard,
  '/wifi': WifiPage,
  '/bluetooth': BluetoothPage,
  '/audio': AudioPage,
  '/settings': SettingsPage
}

export function getCurrentRouteComponent() {
  const hash = window.location.hash.replace('#', '') || '/'
  return routes[hash] || Dashboard
}
