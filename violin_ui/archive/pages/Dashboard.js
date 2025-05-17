import SystemStatus from '../components/SystemStatus.js'
import WifiControl from '../components/WifiControl.js'
import BluetoothControl from '../components/BluetoothControl.js'
import Settings from './Settings.js'
import AudioMixer from '../components/audio/AudioMixer.js'

export default {
  name: "Dashboard",
  template: `
    <div class="dashboard">
      <h1>🎻 Violin Dashboard</h1>
      <SystemStatus />
    </div>
  `,
  components: {
    SystemStatus
  }
}
