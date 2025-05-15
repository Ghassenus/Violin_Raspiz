export default {
  name: "ESP1BluetoothSource",
  template: `
    <div>
      <h4>📡 Source Bluetooth (ESP1)</h4>
      <button @click="toggle">🔀 Activer/Désactiver</button>
    </div>
  `,
  methods: {
    toggle() {
      fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/source/esp1/toggle`, { method: "POST" });
    }
  }
}
