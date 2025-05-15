export default {
  name: "StreamURLSource",
  template: `
    <div>
      <h4>🌐 Stream via URL (YouTube, SoundCloud...)</h4>
      <input type="text" v-model="url" placeholder="https://...">
      <button @click="startStream">▶️ Stream</button>
    </div>
  `,
  data() {
    return { url: "" }
  },
  methods: {
    startStream() {
      fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: this.url })
      });
    }
  }
}
