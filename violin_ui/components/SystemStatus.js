// components/SystemStatus.js
export default {
  template: `
    <div class="status-card">
      <h3>📡 Statut Système ESP1</h3>
      <div v-if="status">
        <p><strong>IP :</strong> {{ status.ip }}</p>
        <p><strong>SSID :</strong> {{ status.ssid }}</p>
        <p><strong>Wi-Fi :</strong> {{ status.wifi ? 'Connecté' : 'Déconnecté' }}</p>
        <p><strong>RSSI :</strong> {{ status.rssi }} dBm</p>
        <p><strong>Batterie :</strong> {{ status.batt }}% ({{ status.batt_voltage }} mV)</p>
        <p><strong>RAM :</strong> {{ status.ram_usage }}% — Flash: {{ status.flash_usage }}%</p>
        <p><strong>Heure :</strong> {{ status.hour }}:{{ status.minute.toString().padStart(2, '0') }}</p>
        <p><strong>Date :</strong> {{ status.day }}/{{ status.month }}/{{ status.year }}</p>
      </div>
      <div v-else>Chargement...</div>
    </div>
  `,
  data() {
    return {
      status: null
    };
  },
  mounted() {
    this.refreshStatus();
    setInterval(this.refreshStatus, 5000);
  },
  methods: {
    refreshStatus() {
      const url = `http://${window.VIOLIN_CONFIG.ESP1_IP}/api/status`;
      fetch(url)
        .then(res => res.json())
        .then(data => { this.status = data; })
        .catch(err => console.warn("Erreur ESP1:", err));
    }
  }
};
