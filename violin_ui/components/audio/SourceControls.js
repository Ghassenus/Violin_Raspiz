export default {
  data() {
    return {
      sources: [
        { key: "local_file", label: "🎵 Fichier Local", active: false },
        { key: "web_upload", label: "🌐 Upload Page Web", active: false },
        { key: "url_stream", label: "🔗 Flux URL", active: false },
        { key: "esp1_bt", label: "📡 Bluetooth ESP1", active: false },
        { key: "esp2_piezo", label: "🎻 ESP2 Piezo", active: false }
      ],
      volumes: {},
      effects: {}
    }
  },
  methods: {
    toggleSource(key) {
      this.sources.find(s => s.key === key).active = !this.sources.find(s => s.key === key).active;
      fetch(`/api/audio/source/${key}/${this.sources.find(s => s.key === key).active ? 'enable' : 'disable'}`);
    },
    updateVolume(key, val) {
      fetch(`/api/audio/source/${key}/params`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volume: parseFloat(val) })
      });
    }
  },
  template: `
    <div>
      <h5>🎚️ Sources</h5>
      <div v-for="s in sources" :key="s.key" class="mb-2">
        <button class="btn btn-sm"
                :class="s.active ? 'btn-success' : 'btn-outline-secondary'"
                @click="toggleSource(s.key)">
          {{ s.label }}
        </button>
        <input type="range" min="0" max="2" step="0.1" :value="volumes[s.key] || 1"
               @input="updateVolume(s.key, $event.target.value)" />
      </div>
    </div>
  `
}
