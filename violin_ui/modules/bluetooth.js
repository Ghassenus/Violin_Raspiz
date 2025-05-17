import { log } from './log.js';

export default {
  autoconnectEnabled: false,
  _devices: [],
  _scanCount: 0,
  _connectedMac: null,

  init() {
    const btnScan = document.getElementById("bt_scan");
    const btnAuto = document.getElementById("bt_autoconnect");
    if (btnScan) btnScan.onclick = () => this.scan();
    if (btnAuto) btnAuto.onclick = () => this.toggleAutoconnect();
    // Liste initiale vide
    this._devices = [];
    this.refresh();
  },

  scan() {
    const statusEl = document.getElementById("bt_status");
    if (!statusEl) return;
    document.getElementById("bt_scan").disabled = true;
    statusEl.innerHTML = `<div class="alert alert-info">⏳ Scan Bluetooth en cours...</div>`;
    setTimeout(() => {
      this._scanCount += 1;
      // Appareils fictifs détectés (un appareil supplémentaire après le 1er scan)
      const baseDevices = [
        { name: "Enceinte JBL", mac: "AA:BB:CC:DD:EE:FF" },
        { name: "", mac: "11:22:33:44:55:66" }
      ];
      if (this._scanCount > 1) {
        baseDevices.push({ name: "Casque BT", mac: "77:88:99:AA:BB:CC" });
      }
      this._devices = baseDevices;
      this.refresh();
      statusEl.innerHTML = `<div class="alert alert-success">✅ Scan terminé : ${this._devices.length} appareil(s).</div>`;
      document.getElementById("bt_scan").disabled = false;
      log.info("🔍 Scan Bluetooth simulé - appareils détectés");
    }, 3000);
  },

  toggleAutoconnect() {
    this.autoconnectEnabled = !this.autoconnectEnabled;
    const btn = document.getElementById("bt_autoconnect");
    if (btn) {
      btn.innerText = this.autoconnectEnabled ? "🔄 AutoConnect: ✅" : "🔄 AutoConnect: ❌";
    }
    const statusEl = document.getElementById("bt_status");
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-info">AutoConnect ${this.autoconnectEnabled ? 'activé' : 'désactivé'}.</div>`;
    }
    log.info(`AutoConnect ${this.autoconnectEnabled ? 'ON' : 'OFF'}`);
  },

  refresh() {
    const zone = document.getElementById("bt_devices");
    if (!zone) return;
    zone.innerHTML = "";
    if (this._devices.length === 0) {
      zone.innerHTML = `<em>Aucun appareil pour le moment. Cliquez sur "Scanner".</em>`;
      return;
    }
    this._devices.forEach(dev => {
      const div = document.createElement("div");
      const name = dev.name && dev.name.length ? dev.name : "(Sans nom)";
      div.innerHTML =
        `<b>${name}</b> – ${dev.mac} ` +
        `${this._connectedMac === dev.mac ? "✅ Connecté" : `<button onclick="bluetooth.connect('${dev.mac}')">🔗 Connecter</button>`}` +
        ` <button onclick="bluetooth.disconnect()">🔌 Déconnecter</button>`;
      zone.appendChild(div);
    });
  },

  connect(mac) {
    const statusEl = document.getElementById("bt_status");
    const dev = this._devices.find(d => d.mac === mac);
    const name = dev && dev.name && dev.name.length ? dev.name : mac;
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-info">⏳ Connexion à ${name}...</div>`;
    }
    // Simulation de la connexion réussie
    setTimeout(() => {
      this._connectedMac = mac;
      this.refresh();
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-success">✅ Connecté à ${name}</div>`;
      }
      log.info(`🔗 Connexion Bluetooth simulée: ${mac}`);
    }, 1000);
  },

  disconnect() {
    const statusEl = document.getElementById("bt_status");
    if (this._connectedMac) {
      const disconnectedMac = this._connectedMac;
      this._connectedMac = null;
      this.refresh();
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-secondary">🔌 Appareil Bluetooth déconnecté</div>`;
      }
      log.info(`🔌 Déconnexion Bluetooth simulée: ${disconnectedMac}`);
    } else {
      log.info("Aucun appareil n'était connecté.");
    }
  }
};
