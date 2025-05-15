<template>
  <div class="source-controls">
    <h4>Sources Audio</h4>

    <div class="source" v-for="src in sources" :key="src.key">
      <label>{{ src.label }}</label>
      <input type="checkbox" v-model="src.enabled" @change="toggleSource(src.key)">
      <input type="range" min="0" max="2" step="0.1" v-model="src.volume" @input="updateSource(src)">
      <button @click="toggleReverb(src.key)">Reverb: {{ src.reverb ? '✔️' : '❌' }}</button>
    </div>

    <hr>

    <h5>🎵 Fichier à streamer</h5>
    <input type="file" @change="streamFile">

    <h5>🌐 URL Stream</h5>
    <input v-model="url" placeholder="https://youtube.com/..." />
    <button @click="streamURL">Stream URL</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const url = ref('')
const sources = reactive([
  { key: 'local_file', label: '📁 Fichier local', enabled: true, volume: 1, reverb: false },
  { key: 'web_upload', label: '⬆️ Upload Web', enabled: false, volume: 1, reverb: false },
  { key: 'url_stream', label: '🌐 URL stream', enabled: false, volume: 1, reverb: false },
  { key: 'esp1_bt', label: '📡 ESP1 Bluetooth', enabled: false, volume: 1, reverb: false },
  { key: 'esp2_piezo', label: '🎻 ESP2 Piezo', enabled: false, volume: 1, reverb: false },
  { key: 'jack_in', label: '🔌 Jack in', enabled: false, volume: 1, reverb: false },
])

function toggleSource(key) {
  fetch(`${RASP_API}/api/audio/source/${key}/enable`, {
    method: 'POST',
    body: JSON.stringify({ enabled: sources.find(s => s.key === key).enabled }),
    headers: { 'Content-Type': 'application/json' }
  })
}
function updateSource(src) {
  fetch(`${RASP_API}/api/audio/source/${src.key}/params`, {
    method: 'POST',
    body: JSON.stringify({ volume: src.volume, reverb: src.reverb }),
    headers: { 'Content-Type': 'application/json' }
  })
}
function toggleReverb(key) {
  const src = sources.find(s => s.key === key)
  src.reverb = !src.reverb
  updateSource(src)
}
function streamFile(event) {
  const file = event.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append("file", file)
  fetch(`${RASP_API}/api/audio/upload`, { method: 'POST', body: formData })
}
function streamURL() {
  fetch(`${RASP_API}/api/audio/url`, {
    method: 'POST',
    body: JSON.stringify({ url: url.value }),
    headers: { 'Content-Type': 'application/json' }
  })
}
</script>

<style scoped>
.source-controls {
  margin-bottom: 20px;
}
.source {
  margin: 5px 0;
}
input[type="range"] {
  width: 120px;
  margin: 0 10px;
}
</style>
