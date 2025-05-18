import { log } from './log.js';

export default {
  autoconnectEnabled: false,
  _devices: [],
  _connectedMac: null,

  init() {
    // Bouton scan
    const btnScan = document.getElementById('bt_scan');
    if (btnScan) btnScan.onclick = () => this.scan();

    // Bouton auto-connect
    const btnAuto = document.getElementById('bt_autoconnect');
    if (btnAuto) btnAuto.onclick = () => this.toggleAutoconnect();

    // Initialisation de la liste et du statut
    this._devices = [];
    this._connectedMac = null;
    this.refresh();

    // Écoute des événements Socket.IO de Raspiz
    if (window.raspSocket) {
      // À chaque appareil détecté pendant le scan
      window.raspSocket.on('bt_device', dev => {
        this._devices.push({ mac: dev.mac, name: dev.name });
        this.refresh();
      });
      // Statut du scan (started/finished)
      window.raspSocket.on('bt_scan', data => {
        const statusEl = document.getElementById('bt_status');
        if (!statusEl) return;

        let msg;
        if (data && typeof data === 'object' && data.status) msg = data.status;
        else if (typeof data === 'string') msg = data;
        else msg = JSON.stringify(data);

        if (data.status === "started") {
          // clear your device list in the UI
          this._devices =[];
          
        } 

        // Afficher statut
        statusEl.innerHTML = `<div class="alert alert-info">🔔 Scan : ${msg}</div>`;

        // Lorsque le scan est terminé, réactiver le bouton et afficher résumé
        if (/finished|done/i.test(msg)) {
          const btn = document.getElementById('bt_scan');
          if (btn) btn.disabled = false;
          statusEl.innerHTML = `<div class="alert alert-success">✅ Scan terminé : ${this._devices.length} appareil(s)</div>`;
        }
      });
    }
  },

  scan() {
    // Réinitialiser la liste d'appareils
    this._devices = [];
    this.refresh();

    // Désactiver le bouton et afficher le message de démarrage
    const btn = document.getElementById('bt_scan');
    if (btn) btn.disabled = true;
    const statusEl = document.getElementById('bt_status');
    if (statusEl) statusEl.innerHTML = `<div class="alert alert-info">⏳ Scan lancé…</div>`;

    // Lancer le scan côté backend
    fetch(`${window.RASPIZ_URL}/api/bluetooth/scan/start`, { method: 'POST' })
      .catch(err => {
        if (statusEl) statusEl.innerHTML = `<div class="alert alert-danger">❌ Erreur scan : ${err}</div>`;
        if (btn) btn.disabled = false;
        log.error('Scan Bluetooth : ' + err);
      });
  },

  toggleAutoconnect() {
    this.autoconnectEnabled = !this.autoconnectEnabled;
    const btn = document.getElementById('bt_autoconnect');
    if (btn) btn.innerText = this.autoconnectEnabled
      ? '🔄 AutoConnect : ✅'
      : '🔄 AutoConnect : ❌';
    const statusEl = document.getElementById('bt_status');
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-info">AutoConnect ${this.autoconnectEnabled ? 'activé' : 'désactivé'}.</div>`;
    }
    log.info(`AutoConnect ${this.autoconnectEnabled ? 'ON' : 'OFF'}`);
  },

  refresh() {
    const zone = document.getElementById('bt_devices');
    if (!zone) return;
    zone.innerHTML = '';
    if (this._devices.length === 0) {
      zone.innerHTML = `<em>Aucun appareil pour le moment. Cliquez sur "Scanner".</em>`;
      return;
    }
    this._devices.forEach(dev => {
      const name = dev.name && dev.name.length ? dev.name : '(Sans nom)';
      const isConnected = this._connectedMac === dev.mac;
      const div = document.createElement('div');
      div.innerHTML =
        `<b>${name}</b> – ${dev.mac} ` +
        `${isConnected
          ? '✅ Connecté'
          : `<button onclick="bluetooth.connect('${dev.mac}')">🔗 Connecter</button>`
        } ` +
        `<button onclick="bluetooth.disconnect()">🔌 Déconnecter</button>`;
      zone.appendChild(div);
    });
  },

  connect(mac) {
    const statusEl = document.getElementById('bt_status');
    if (statusEl) statusEl.innerHTML = `<div class="alert alert-info">⏳ Connexion à ${mac}…</div>`;

    fetch(`${window.RASPIZ_URL}/api/bluetooth/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac })
    })
      .then(r => r.json())
      .then(j => {
        this._connectedMac = mac;
        this.refresh();
        if (statusEl) statusEl.innerHTML = `<div class="alert alert-success">✅ Connecté à ${mac}</div>`;
        log.info(`🔗 Connexion Bluetooth: ${mac}`);
      })
      .catch(err => {
        if (statusEl) statusEl.innerHTML = `<div class="alert alert-danger">❌ ${err}</div>`;
        log.error(err);
      });
  },

  disconnect() {
    fetch(`${window.RASPIZ_URL}/api/bluetooth/disconnect`, { method: 'POST' })
      .then(() => {
        this._connectedMac = null;
        this.refresh();
        const statusEl = document.getElementById('bt_status');
        if (statusEl) statusEl.innerHTML = `<div class="alert alert-secondary">🔌 Déconnecté</div>`;
        log.info('🔌 Déconnexion Bluetooth');
      })
      .catch(err => log.error(err));
  }
};
