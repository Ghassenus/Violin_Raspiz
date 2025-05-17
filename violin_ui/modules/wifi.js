export default {
  init() {
    document.getElementById("wifiScan").onclick = this.scan;
    document.getElementById("wifiConnect").onclick = this.connect;
  },

  scan() {
    fetch(`http://${ESP1_IP}/api/wifi/scan`, { method: "POST" })
      .then(() => log.info("📶 Scan Wi-Fi lancé"))
      .catch(log.error);
  },

  connect() {
    const ssid = document.getElementById("ssid_input").value.trim();
    const pass = document.getElementById("pass_input").value.trim();
    fetch(`http://${ESP1_IP}/api/wifi/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssid, pass })
    }).then(() => log.info(`📶 Connexion à ${ssid}`))
      .catch(log.error);
  }
};
