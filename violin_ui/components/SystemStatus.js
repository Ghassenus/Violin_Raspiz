<template>
  <div class="status-card">
    <h3>État Système ESP1</h3>
    <div v-if="status">
      <p>Wi-Fi: <b>{{ status.wifi ? 'Connecté' : 'Déconnecté' }}</b></p>
      <p>IP: {{ status.ip }} — SSID: {{ status.ssid }}</p>
      <p>RSSI: {{ status.rssi }} dBm</p>
      <p>Batterie: {{ status.batt }}% ({{ status.batt_voltage }} mV)</p>
      <p>RAM: {{ status.ram_usage }}% — Flash: {{ status.flash_usage }}%</p>
    </div>
    <div v-else>Chargement...</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const status = ref(null);
const ESP1 = window.VIOLIN_CONFIG.ESP1_IP;
const RASPI = window.VIOLIN_CONFIG.RASPI_IP;

function refresh() {
  fetch(`http://${ESP1}/api/status`)
    .then(r => r.json())
    .then(json => status.value = json)
    .catch(e => console.warn("Erreur ESP1", e));
}

onMounted(() => {
  refresh();
  setInterval(refresh, 5000);
});
</script>
