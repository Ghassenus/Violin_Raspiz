<template>
  <div class="playback-controls">
    <h4>⏯️ Contrôle Playback</h4>
    <button @click="play">▶️ Play</button>
    <button @click="pause">⏸️ Pause</button>
    <button @click="rewind">⏪ -10s</button>
    <button @click="forward">⏩ +10s</button>
  </div>
</template>

<script setup>
function play() {
  fetch(`${RASP_API}/api/audio/play`, { method: "POST" })
}
function pause() {
  fetch(`${RASP_API}/api/audio/pause`, { method: "POST" })
}
function rewind() {
  fetch(`${RASP_API}/api/audio/seek`, {
    method: "POST",
    body: JSON.stringify({ offset: -10 }),
    headers: { 'Content-Type': 'application/json' }
  })
}
function forward() {
  fetch(`${RASP_API}/api/audio/seek`, {
    method: "POST",
    body: JSON.stringify({ offset: 10 }),
    headers: { 'Content-Type': 'application/json' }
  })
}
</script>

<style scoped>
.playback-controls button {
  margin-right: 5px;
}
</style>
