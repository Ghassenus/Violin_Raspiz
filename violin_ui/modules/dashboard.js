import { log } from './log.js';

export default {
  _initDone: false,
  _intervalId: null,

  init() {
    const btnReboot = document.getElementById("reboot_esp");
    const btnTestAudio = document.getElementById("test_audio");
    if (btnReboot) btnReboot.onclick = () => this.rebootESP();
    if (btnTestAudio) btnTestAudio.onclick = () => this.testRaspiAudio();

    // Initialiser les données de statut simulées si pas déjà fait
    if (!window.deviceStatus) {
      const now = new Date();
      window.deviceStatus = {
        wifi: false,
        ssid: "(non connecté)",
        ip: "0.0.0.0",
        rssi: 0,
        batt: 100,
        batt_voltage: 4100,
        hour: now.getHours(),
        minute: now.getMinutes(),
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        fmt24h: true,
        ram_usage: 30,
        flash_usage: 10
      };
    }

    this.refreshStatus();
    if (!this._initDone) {
      // Mise à jour du statut toutes les 5 sec
      this._intervalId = setInterval(() => this.refreshStatus(), 5000);
      this._initDone = true;
    }
  },

  refreshStatus() {
    const marquee = document.getElementById("statusMarquee");
    if (!marquee) return;
    const data = window.deviceStatus;
    // Faire évoluer certaines valeurs (simulation)
    if (data.minute !== undefined) {
      data.minute += 1;
      if (data.minute >= 60) {
        data.minute = 0;
        data.hour = (data.hour + 1) % 24;
        // Incrémenter le jour si l'heure boucle (approximation simple)
        if (data.hour === 0) {
          data.day = (data.day % 31) + 1;
          data.month = (data.month % 12) + 1;
          // (Note: changement d'année non géré pour simplifier)
        }
      }
    }
    if (data.batt !== undefined && data.batt > 0) {
      data.batt -= 1;
      if (data.batt < 0) data.batt = 0;
      // Tension batterie approximative
      data.batt_voltage = Math.max(3300, data.batt_voltage - 10);
    }
    marquee.innerText =
      `WiFi: ${data.wifi ? "Connecté" : "Déconnecté"} | ` +
      `SSID: ${data.ssid || ""} | IP: ${data.ip} | RSSI: ${data.rssi} dBm | ` +
      `Batt: ${data.batt}% (${data.batt_voltage} mV) | ` +
      `Heure: ${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')} | ` +
      `Date: ${data.day}/${data.month}/${data.year} | ` +
      `${data.fmt24h ? "24h" : "12h"} | ` +
      `RAM: ${data.ram_usage}% | FLASH: ${data.flash_usage}%`;
  },

  rebootESP() {
    const msgDiv = document.getElementById("dashboard_msg");
    // Simulation du redémarrage : Wi-Fi off pendant 3 sec
    const prev = { wifi: window.deviceStatus.wifi, ssid: window.deviceStatus.ssid, ip: window.deviceStatus.ip, rssi: window.deviceStatus.rssi };
    window.deviceStatus.wifi = false;
    window.deviceStatus.ssid = "(non connecté)";
    window.deviceStatus.ip = "0.0.0.0";
    window.deviceStatus.rssi = 0;
    if (msgDiv) {
      msgDiv.innerHTML = `<div class="alert alert-warning">🔁 Redémarrage de l'ESP...</div>`;
    }
    setTimeout(() => {
      // Restauration de l'état précédent
      window.deviceStatus.wifi = prev.wifi;
      window.deviceStatus.ssid = prev.ssid;
      window.deviceStatus.ip = prev.ip;
      window.deviceStatus.rssi = prev.rssi;
      if (msgDiv) {
        msgDiv.innerHTML = `<div class="alert alert-success">✅ ESP redémarré</div>`;
        setTimeout(() => { msgDiv.innerHTML = ""; }, 3000);
      }
    }, 3000);
    log.info("🔄 Redémarrage ESP simulé");
  },

  testRaspiAudio() {
    const msgDiv = document.getElementById("dashboard_msg");
    if (msgDiv) {
      msgDiv.innerHTML = `<div class="alert alert-info">▶️ Test audio Raspi lancé (simulation)</div>`;
      setTimeout(() => { msgDiv.innerHTML = ""; }, 3000);
    }
    log.info("🔈 Test audio RaspZ simulé");
  },

  // Nettoyage lors du changement de page
  cleanup() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._initDone = false;
  }
};
