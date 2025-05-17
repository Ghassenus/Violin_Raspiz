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
  fetch(`${window.ESP1_URL}/api/status`)
    .then(r => r.json())
    .then(data => {
      const m = document.getElementById("statusMarquee");
      m.innerText =
        `WiFi: ${data.wifi ? "OK" : "KO"} | SSID: ${data.ssid} | IP: ${data.ip} | ` +
        `RSSI: ${data.rssi} dBm | Batt: ${data.batt}% (${data.batt_voltage} mV) | ` +
        `Date: ${data.day}/${data.month}/${data.year} ${data.hour.toString().padStart(2,'0')}:${data.minute.toString().padStart(2,'0')} | ` +
        `RAM: ${data.ram_usage}% | FLASH: ${data.flash_usage}%`;
    })
    .catch(err => log.error("Status ESP1 : " + err));
  },
  rebootESP() {
    const msgDiv = document.getElementById("dashboard_msg");
    fetch(`${window.ESP1_URL}/api/system/reboot`, { method: "POST" })
      .then(() => {
        msgDiv.innerHTML = `<div class="alert alert-warning">🔁 Redémarrage en cours…</div>`;
      })
      .catch(err => {
        msgDiv.innerHTML = `<div class="alert alert-danger">❌ Erreur reboot : ${err}</div>`;
        log.error(err);
      });
  },
  testRaspiAudio() {
    const msgDiv = document.getElementById("dashboard_msg");
    fetch(`${window.RASPIZ_URL}/api/bluetooth/test_audio`, { method: "POST" })
      .then(r => r.json())
      .then(j => {
        msgDiv.innerHTML = `<div class="alert alert-info">▶️ Audio Pi : ${j.status}</div>`;
      })
      .catch(err => {
        msgDiv.innerHTML = `<div class="alert alert-danger">❌ Test audio Pi : ${err}</div>`;
        log.error(err);
      });
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
