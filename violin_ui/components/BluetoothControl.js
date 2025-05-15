export default {
  template: `
    <div>
      <h3>🔊 Bluetooth (RaspZ)</h3>
      <div>
        <button class="btn btn-info" @click="startScan">📡 Scanner</button>
        <button class="btn btn-warning ms-2" @click="toggleAuto">🔄 AutoConnect</button>
      </div>
      <ul v-if="devices.length" class="mt-3">
        <li v-for="d in devices" :key="d.mac">
          {{ d.name || '(Sans nom)' }} - {{ d.mac }}
          <button class="btn btn-success btn-sm ms-2" @click="connect(d.mac)">Connecter</button>
          <button class="btn btn-danger btn-sm ms-2" @click="disconnect">Déconnecter</button>
        </li>
      </ul>
    </div>
  `,
  data() {
    return {
      devices: [],
    };
  },
  methods: {
    startScan() {
      fetch(`${window.RASPZ_BASE}/api/bluetooth/scan/start`, { method: "POST" })
        .then(() => setTimeout(this.refresh, 5000));
    },
    refresh() {
      fetch(`${window.RASPZ_BASE}/api/bluetooth/scan/results`)
        .then(res => res.json())
        .then(data => { this.devices = data.devices });
    },
    connect(mac) {
      fetch(`${window.RASPZ_BASE}/api/bluetooth/connect`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac })
      }).then(() => alert("Connexion envoyée"));
    },
    disconnect() {
      fetch(`${window.RASPZ_BASE}/api/bluetooth/disconnect`, { method: "POST" });
    },
    toggleAuto() {
      fetch(`${window.RASPZ_BASE}/api/bluetooth/autoconnect`)
        .then(res => res.json())
        .then(data => {
          fetch(`${window.RASPZ_BASE}/api/bluetooth/autoconnect`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: !data.autoconnect })
          });
        });
    }
  },
  mounted() {
    this.refresh();
  }
};
