export default {
  methods: {
    send(cmd) {
      fetch(`/api/audio/playback/${cmd}`, { method: "POST" });
    }
  },
  template: `
    <div>
      <h5>▶️ Commandes Lecture</h5>
      <div class="btn-group">
        <button class="btn btn-outline-light btn-sm" @click="send('play')">⏯️ Play/Pause</button>
        <button class="btn btn-outline-light btn-sm" @click="send('rewind')">⏪ -10s</button>
        <button class="btn btn-outline-light btn-sm" @click="send('forward')">⏩ +10s</button>
        <button class="btn btn-outline-danger btn-sm" @click="send('stop')">⏹️ Stop</button>
      </div>
    </div>
  `
}
