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
    fetch(`${window.ESP1_BASE}/api/status`)
      .then(res => res.json())
      .then(data => this.brightness = data.brightness || 50);
  },
  methods: {
    updateBrightness() {
      fetch(`${window.ESP1_BASE}/api/params/brightness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: this.brightness })
      });
    },
    reboot() {
      if (confirm("Redémarrer ESP32 ?")) {
        fetch(`${window.ESP1_BASE}/api/system/reboot`, { method: "POST" });
      }
    }
  }
};
