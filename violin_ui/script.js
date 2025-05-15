const ESP1_IP  = "192.168.1.59";
const RASPI_IP = "192.168.1.123";

const espSocket = new WebSocket(`ws://${ESP1_IP}:81`);
espSocket.binaryType = 'arraybuffer';
espSocket.onopen = () => logWS("ESP1 WebSocket connecté");
espSocket.onmessage = (event) => {
  if (typeof event.data !== 'string') return;
  let msg;
  try { msg = JSON.parse(event.data); } catch { return; }
  logWS("ESP1 → " + JSON.stringify(msg));
  if (msg.type === "bt_status") {
    document.getElementById("connected_device").innerText =
      msg.data === "connect_ok" ? "🟢 Connecté à un périphérique" : "🔴 Déconnecté";
  }
};

const socket = io(`http://${RASPI_IP}:5000`);
socket.on("connect", () => logWS("RaspZ Socket.IO connecté"));
socket.on("bt_scan", (data) => {
  const el = document.getElementById("bt_raspz_results");
  if (data.status === "started") el.innerHTML = "<i>Scan en cours...</i>";
  if (data.status === "finished") refreshBluetoothListRaspz();
});
socket.on("bt_device", (dev) => {
  const zone = document.getElementById("bt_raspz_results");
  const div = document.createElement("div");
  div.innerHTML = `<b>${dev.name || "(Sans nom)"}</b> - ${dev.mac}`;
  zone.appendChild(div);
});

function api(path) {
  return `http://${RASPI_IP}${path}`;
}

function scanBluetoothRaspz() {
  fetch(api("/api/bluetooth/scan/start"), { method: "POST" })
    .then(() => logInfo("Scan Bluetooth RaspZ lancé"))
    .catch(e => logError("Erreur scan BT RaspZ : " + e));
}

function refreshBluetoothListRaspz() {
  fetch(api("/api/bluetooth/scan/results"))
    .then(res => res.json())
    .then(json => {
      const zone = document.getElementById("bt_raspz_results");
      zone.innerHTML = "";
      json.devices.forEach(dev => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${dev.name || "(Sans nom)"}</b> - ${dev.mac}`;
        zone.appendChild(div);
      });
    });
}

function logInfo(msg)  { logToConsole("[INFO] " + msg); }
function logError(msg) { logToConsole("[ERREUR] " + msg); }
function logWS(msg)    { logToConsole("[WS] " + msg); }

function logToConsole(msg) {
  const log = document.getElementById("console_log");
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}