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
  fetch(`${window.ESP1_URL}/api/wifi/scan`, { method: "POST" })
    .then(() => {
      statusEl.innerHTML = `<div class="alert alert-info">⏳ Scan Wi-Fi en cours…</div>`;
      return fetch(`${window.ESP1_URL}/api/wifi/list`);
    })
    .then(r => r.json())
    .then(j => {
      const listEl = document.getElementById("wifi_list");
      listEl.innerHTML = "";
      j.networks.forEach(n => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="link-primary" style="cursor:pointer" onclick="wifi.selectSSID('${n.ssid}',true)">${n.ssid}</span>`;
        listEl.appendChild(li);
      });
      statusEl.innerHTML = `<div class="alert alert-success">✅ ${j.networks.length} réseau(x) trouvé(s)</div>`;
    })
    .catch(err => {
      document.getElementById("wifi_status").innerHTML =
        `<div class="alert alert-danger">❌ Erreur scan : ${err}</div>`;
      log.error(err);
    });
 },

  connect() {
    const ssid = document.getElementById("ssid_input").value;
    const pass = document.getElementById("pass_input").value;
    const body = JSON.stringify({ ssid, password: pass });
    // → Si ton ESP1 supporte un /api/wifi/connect avec SSID+pass
    fetch(`${window.ESP1_URL}/api/wifi/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    })
      .then(r => r.json())
      .then(j => {
        const s = j.status || "ok";
        document.getElementById("wifi_status").innerHTML =
          `<div class="alert alert-success">🔗 ${s}</div>`;
      })
      .catch(err => {
        document.getElementById("wifi_status").innerHTML =
          `<div class="alert alert-danger">❌ ${err}</div>`;
        log.error(err);
      });
  },

};
