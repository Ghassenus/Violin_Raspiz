export default {
  init() {
    document.getElementById("bt_scan").onclick = this.scan;
    document.getElementById("bt_autoconnect").onclick = this.toggleAutoconnect;
    this.refresh();

    if (!window.raspSocket) {
      window.raspSocket = io(`http://${window.RASPI_IP}`, {
        transports: ['websocket'], upgrade: false
      });
    }

    window.raspSocket.on("connect", () => log.info("🟢 RaspZ Socket.IO connecté"));
    window.raspSocket.on("bt_scan", data => {
      if (data.status === "finished") this.refresh();
    });
    window.raspSocket.on("bt_device", () => this.refresh());
  },

  scan() {
    if (window.raspSocket) {
      window.raspSocket.emit("start_scan");
      log.info("🔍 Scan Bluetooth demandé");
      document.getElementById("bt_status").innerText = "⏳ Scan en cours...";
    } else {
      log.error("❌ Socket.IO non initialisé");
    }
  },

  toggleAutoconnect() {
    fetch(`http://${window.RASPI_IP}/api/bluetooth/autoconnect`)
      .then(r => r.json())
      .then(data => {
        const enabled = !data.autoconnect;
        return fetch(`http://${window.RASPI_IP}/api/bluetooth/autoconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled })
        }).then(() => {
          document.getElementById("bt_autoconnect").innerText =
            enabled ? "🔄 AutoConnect: ✅" : "🔄 AutoConnect: ❌";
        });
      }).catch(log.error);
  },

  refresh() {
    fetch(`http://${window.RASPI_IP}/api/bluetooth/scan/results`)
      .then(r => r.json())
      .then(json => {
        const zone = document.getElementById("bt_devices");
        zone.innerHTML = "";
        json.devices.forEach(dev => {
          const div = document.createElement("div");
          div.innerHTML = `
            <b>${dev.name || "(Sans nom)"}</b> – ${dev.mac}
            <button onclick="bluetooth.connect('${dev.mac}')">🔗 Connecter</button>
            <button onclick="bluetooth.disconnect()">🔌 Déconnecter</button>
          `;
          zone.appendChild(div);
        });
      }).catch(log.error);
  },

  connect(mac) {
    fetch(`http://${window.RASPI_IP}/api/bluetooth/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mac })
    }).then(() => log.info(`🔗 Connexion Bluetooth: ${mac}`))
      .catch(log.error);
  },

  disconnect() {
    fetch(`http://${window.RASPI_IP}/api/bluetooth/disconnect`, { method: "POST" })
      .then(() => log.info("🔌 Bluetooth déconnecté"))
      .catch(log.error);
  }
};
