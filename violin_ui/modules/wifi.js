import { log } from './log.js';

export default {
  init() {
    const btnScan = document.getElementById("wifi_scan");
    const btnConnect = document.getElementById("wifi_connect");
    if (btnScan) btnScan.onclick = () => this.scan();
    if (btnConnect) btnConnect.onclick = () => this.connect();
  },

  scan() {
    const statusEl = document.getElementById("wifi_status");
    const listEl = document.getElementById("wifi_list");
    if (!statusEl || !listEl) return;
    // Désactiver les boutons pendant le scan
    document.getElementById("wifi_scan").disabled = true;
    document.getElementById("wifi_connect").disabled = true;
    statusEl.innerHTML = `<div class="alert alert-info">⏳ Scan Wi-Fi en cours...</div>`;
    setTimeout(() => {
      // Réseaux Wi-Fi fictifs détectés
      const networks = [
        { ssid: "Livebox-1234", rssi: -80, secure: true },
        { ssid: "FreeWifi", rssi: -60, secure: false },
        { ssid: "PhoneHotspot", rssi: -50, secure: true }
      ];
      // Affichage de la liste des réseaux
      listEl.innerHTML = "";
      networks.forEach(net => {
        const li = document.createElement("li");
        li.innerHTML =
          `<span style="cursor:pointer; text-decoration:underline;" onclick="wifi.selectSSID('${net.ssid}', ${net.secure})">${net.ssid}</span>` +
          ` – ${net.rssi} dBm ${net.secure ? '🔒' : '🔓'}`;
        listEl.appendChild(li);
      });
      statusEl.innerHTML = `<div class="alert alert-success">✅ Scan terminé : ${networks.length} réseau(x) trouvé(s).</div>`;
      document.getElementById("wifi_scan").disabled = false;
      document.getElementById("wifi_connect").disabled = false;
      log.info("📶 Scan Wi-Fi simulé - réseaux détectés");
    }, 2000);
  },

  selectSSID(name, secure) {
    const ssidField = document.getElementById("ssid_input");
    const passField = document.getElementById("pass_input");
    ssidField.value = name;
    if (passField) {
      passField.value = "";
      if (secure) {
        passField.placeholder = "Mot de passe requis";
        passField.focus();
      } else {
        passField.placeholder = "(aucun mot de passe)";
      }
    }
  },

  connect() {
    const ssid = document.getElementById("ssid_input").value.trim();
    const pass = document.getElementById("pass_input").value.trim();
    const statusEl = document.getElementById("wifi_status");
    if (!ssid) {
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-warning">⚠️ Veuillez saisir un SSID.</div>`;
      }
      return;
    }
    // Simulation de la tentative de connexion
    document.getElementById("wifi_connect").disabled = true;
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-info">⏳ Connexion à "${ssid}"...</div>`;
    }
    setTimeout(() => {
      // Mettre à jour le statut global (connecté)
      if (window.deviceStatus) {
        window.deviceStatus.wifi = true;
        window.deviceStatus.ssid = ssid;
        window.deviceStatus.ip = window.deviceStatus.ip && window.deviceStatus.ip !== "0.0.0.0"
          ? window.deviceStatus.ip.replace(/\d+$/, match => Math.min(254, parseInt(match) + 1))
          : "192.168.1.60";
        window.deviceStatus.rssi = -50;
      }
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-success">✅ Connecté au réseau "${ssid}".</div>`;
      }
      document.getElementById("wifi_connect").disabled = false;
      log.info(`📶 Connexion simulée au SSID ${ssid}`);
    }, 1500);
  }
};
