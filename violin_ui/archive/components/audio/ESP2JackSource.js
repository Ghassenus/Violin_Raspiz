export default {
  name: "ESP2JackSource",
  template: `
    <div>
      <h4>🎙️ Jack (ESP2 / Piezo)</h4>
      <button @click="toggle">🎚️ Activer/Désactiver</button>
    </div>
  `,
  methods: {
    toggle() {
      fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/source/jack/toggle`, { method: "POST" });
    }
  }
}
