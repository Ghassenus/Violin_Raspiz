export default {
  _initDone: false,

  init() {
    this.refreshStatus();
    setInterval(() => this.refreshStatus(), 5000);
  },

  refreshStatus() {
    fetch(`http://${window.ESP1_IP}/api/status`)
      .then(res => res.json())
      .then(data => {
        const marquee = document.getElementById("statusMarquee");
        if (marquee) {
          marquee.innerText = `
            WiFi: ${data.wifi ? "Connecté" : "Déconnecté"} | 
            SSID: ${data.ssid} | IP: ${data.ip} | RSSI: ${data.rssi} dBm | 
            Batt: ${data.batt}% (${data.batt_voltage} mV) | 
            Heure: ${data.hour}:${String(data.minute).padStart(2, '0')} | 
            Date: ${data.day}/${data.month}/${data.year} | 
            ${data.fmt24h ? "24h" : "12h"} | 
            RAM: ${data.ram_usage}% | FLASH: ${data.flash_usage}%
          `;
        }
      })
      .catch(err => log.error(err));
  },

  rebootESP() {
    fetch(`http://${window.ESP1_IP}/api/system/reboot`, { method: "POST" })
      .then(() => log.info("🔄 Redémarrage ESP demandé"))
      .catch(log.error);
  },

  testRaspiAudio() {
    fetch(`http://${window.RASPI_IP}/api/bluetooth/test_audio`, { method: "POST" })
      .then(() => log.info("🔈 Test audio RaspZ lancé"))
      .catch(log.error);
  }
};
