import BluetoothControl from '../components/BluetoothControl.js'

export default {
  name: "Bluetooth",
  components: { BluetoothControl },
  template: `
    <div class="page bluetooth">
      <h2>🟦 Bluetooth RaspZ</h2>
      <BluetoothControl />
    </div>
  `
}
