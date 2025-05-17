import WifiControl from '../components/WifiControl.js'

export default {
  name: "Wifi",
  components: { WifiControl },
  template: `
    <div class="page wifi">
      <h2>📶 Contrôle Wi-Fi</h2>
      <WifiControl />
    </div>
  `
}
