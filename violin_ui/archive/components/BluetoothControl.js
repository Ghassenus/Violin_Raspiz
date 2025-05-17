export default {
  name: "BluetoothControl",
  template: `
    <div class="bluetooth-control">
      <h3>🟦 Bluetooth – RaspZ</h3>

      <button class="btn btn-primary" @click="startScan">🔍 Scanner</button>
      <button class="btn btn-secondary" @click="toggleAutoconnect">
        🔄 AutoConnect : {{ autoconnect ? '✅' : '❌' }}
      </button>

      <div id="bt_raspz_status" class="mt-2"></div>
      <div v-if="devices.length === 0" class="mt-2">Aucun appareil détecté.</div>
      <div id="bt_raspz_results">
        <div v-for="dev in devices" :key="dev.mac" class="bt-device">
          <b>{{ dev.name || '(Sans nom)' }}</b> – {{ dev.mac }}
          <button class="btn btn-sm btn-success ms-2" @click="connect(dev.mac)">Connecter</button>
          <button class="btn btn-sm btn-danger ms-2" @click="disconnect()">Déconnecter</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      devices: [],
      autoconnect: false,
    };
  },
  mounted() {
    this.refreshDevices();
    this.getAutoconnectStatus();

    if (window.raspSocket) {
      window.raspSocket.on("connect", () => {
        this.logTerminal("[Socket.IO] ✅ Connecté");
      });

      window.raspSocket.on("bt_scan", (data) => {
        const statusEl = document.getElementById("bt_raspz_status");
        if (data.status === "started") statusEl.innerText = "🔍 Scan en cours...";
        if (data.status === "finished") {
          statusEl.innerText = "✅ Scan terminé.";
          this.refreshDevices();
        }
      });

      window.raspSocket.on("bt_device", (dev) => {
        this.devices.push(dev);
        this.logTerminal(`[RASPZ] Appareil détecté: ${dev.name || '(Sans nom)'} (${dev.mac})`);
      });
    }
  },
  methods: {
    startScan() {
      if (window.raspSocket?.connected) {
        this.devices = [];
        window.raspSocket.emit("start_scan", {});  // ✅ important de passer un objet
        this.logTerminal("[UI] 🔍 Scan Bluetooth demandé");
      } else {
        console.warn("[BluetoothControl] Socket.IO non connecté");
        this.logTerminal("❌ Socket.IO non connecté");
      }
    },
    refreshDevices() {
      const url = `http://${window.VIOLIN_CONFIG.RASPI_IP}/api/bluetooth/scan/results`;
      fetch(url)
        .then(res => res.json())
        .then(json => this.devices = json.devices)
        .catch(err => console.warn("Erreur récupération périphériques :", err));
    },
    connect(mac) {
      const url = `http://${window.VIOLIN_CONFIG.RASPI_IP}/api/bluetooth/connect`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac })
      })
      .then(res => res.json())
      .then(json => this.logTerminal("BT Connecté: " + JSON.stringify(json)))
      .catch(err => this.logTerminal("Erreur connexion BT: " + err));
    },
    disconnect() {
      const url = `http://${window.VIOLIN_CONFIG.RASPI_IP}/api/bluetooth/disconnect`;
      fetch(url, { method: "POST" })
        .then(res => res.json())
        .then(json => this.logTerminal("BT Déconnecté: " + JSON.stringify(json)))
        .catch(err => this.logTerminal("Erreur déconnexion BT: " + err));
    },
    getAutoconnectStatus() {
      const url = `http://${window.VIOLIN_CONFIG.RASPI_IP}/api/bluetooth/autoconnect`;
      fetch(url)
        .then(res => res.json())
        .then(json => this.autoconnect = json.autoconnect || false);
    },
    toggleAutoconnect() {
      const newValue = !this.autoconnect;
      const url = `http://${window.VIOLIN_CONFIG.RASPI_IP}/api/bluetooth/autoconnect`;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newValue })
      })
      .then(() => this.autoconnect = newValue)
      .catch(err => this.logTerminal("Erreur AutoConnect: " + err));
    },
    logTerminal(msg) {
      const term = document.getElementById("terminal_log");
      if (!term) return;
      const line = document.createElement("div");
      line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
    }
  }
};
