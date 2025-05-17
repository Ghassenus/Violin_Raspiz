import UploadFileSource from './UploadFileSource.js'
import StreamURLSource from './StreamURLSource.js'
import ESP1BluetoothSource from './ESP1BluetoothSource.js'
import ESP2JackSource from './ESP2JackSource.js'

export default {
  name: "AudioMixer",
  template: `
    <div class="audio-mixer">
      <h2>🎚️ Audio Mixer</h2>
      <UploadFileSource />
      <StreamURLSource />
      <ESP1BluetoothSource />
      <ESP2JackSource />

      <hr />
      <div class="output-controls">
        <label>Sortie audio :</label>
        <select v-model="output" @change="changeOutput">
          <option value="bluetooth">Bluetooth</option>
          <option value="jack">Jack</option>
          <option value="both">Les deux</option>
        </select>
        <button @click="play">▶️ Play</button>
        <button @click="pause">⏸️ Pause</button>
        <button @click="forward">⏩ 10s</button>
        <button @click="rewind">⏪ 10s</button>
      </div>
    </div>
  `,
  data() {
    return { output: "bluetooth" }
  },
  methods: {
    changeOutput() {
      fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/output`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: this.output })
      });
    },
    play()     { fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/play`, { method: "POST" }) },
    pause()    { fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/stop`, { method: "POST" }) },
    forward()  { fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/forward`, { method: "POST" }) },
    rewind()   { fetch(`http://${window.VIOLIN_CONFIG.RASPI_IP}/api/audio/backward`, { method: "POST" }) }
  },
  components: {
    UploadFileSource,
    StreamURLSource,
    ESP1BluetoothSource,
    ESP2JackSource
  }
}
