export default {
  template: `
    <div>
      <h3>⚙️ Paramètres ESP1</h3>
      <div>
        <label>Luminosité :</label>
        <input type="range" min="0" max="100" v-model="brightness" @change="updateBrightness">
        <span>{{ brightness }}%</span>
      </div>
      <div class="mt-2">
        <button @click="reboot" class="btn btn-danger">Redémarrer ESP</button>
      </div>
    </div>
  `,
  data() {
    return {
      brightness: 50
    };
  },
  mounted() {
    fetch(`http://${window.VIOLIN_CONFIG.ESP1_IP}/api/status`)
      .then(res => res.json())
      .then(data => this.brightness = data.brightness || 50);
  },
  methods: {
    updateBrightness() {
      fetch(`http://${window.VIOLIN_CONFIG.ESP1_IP}/api/params/brightness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: this.brightness })
      });
    },
    reboot() {
      if (confirm("Redémarrer ESP32 ?")) {
        fetch(`http://${window.VIOLIN_CONFIG.ESP1_IP}/api/system/reboot`, { method: "POST" });
      }
    }
  }
};
