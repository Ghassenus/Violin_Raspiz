<template>
  <div class="dashboard">
    <h1>🎻 Violin Dashboard</h1>

    <SystemStatus />
    <WifiControl />
    <BluetoothControl />
    <Settings />

    <!-- Audio mixer sera ajouté plus tard ici -->
    <!-- <AudioMixer /> -->

    <div class="mt-4">
      <p><strong>Logs</strong></p>
      <div id="console_log" class="log-console"></div>
    </div>
  </div>
</template>

<script setup>
import SystemStatus from '../components/SystemStatus.js'
import WifiControl from '../components/WifiControl.js'
import BluetoothControl from '../components/BluetoothControl.vue'
import Settings from '../components/Settings.js'
// import AudioMixer from '../components/AudioMixer.vue' // à venir
</script>

<style scoped>
.dashboard {
  padding: 20px;
  color: white;
}
.log-console {
  background: black;
  color: #0f0;
  font-family: monospace;
  font-size: 0.9em;
  height: 150px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #444;
}
</style>
