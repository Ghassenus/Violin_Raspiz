<template>
  <div class="output-controls">
    <h4>🎚️ Sortie Audio</h4>
    <select v-model="target" @change="changeTarget">
      <option value="bluetooth">Bluetooth</option>
      <option value="jack">Jack</option>
      <option value="both">Les deux</option>
    </select>

    <label>Volume sortie :</label>
    <input type="range" min="0" max="2" step="0.1" v-model="volume" @input="updateOutput">
  </div>
</template>

<script setup>
import { ref } from 'vue'

const target = ref("bluetooth")
const volume = ref(1.0)

function changeTarget() {
  fetch(`${RASP_API}/api/audio/output`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: target.value })
  })
}
function updateOutput() {
  fetch(`${RASP_API}/api/audio/output/volume`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volume: volume.value })
  })
}
</script>

<style scoped>
.output-controls {
  margin-bottom: 20px;
}
</style>
