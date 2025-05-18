import { io } from "../vendor/socket.io/socket.io.esm.min.js";
import { log } from './log.js';

export default {
  wsEsp1: null,
  wsRaspiz: null,
  ioRaspiz: null,

  init() {
    const uartEl    = document.getElementById("uart_errors");
    const consoleEl = document.getElementById("console_log");

    // 1) WebSocket ESP1 (port 81) – UART errors & BT status
    if (!this.wsEsp1) {
      this.wsEsp1 = new WebSocket(window.ESP1_WS);
      this.wsEsp1.onopen = () => {
        consoleEl.innerHTML += "[WS-ESP1] connecté<br>";
        consoleEl.scrollTop = consoleEl.scrollHeight;
      };
      this.wsEsp1.onmessage = evt => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "uart_error") {
            uartEl.innerHTML += `${msg.data}<br>`;
          } else {
            consoleEl.innerHTML += `[ESP1:${msg.type}] ${msg.data}<br>`;
          }
        } catch {
          // message binaire ou non-JSON
          consoleEl.innerHTML += `[ESP1:DATA] ${evt.data}<br>`;
        }
        consoleEl.scrollTop = consoleEl.scrollHeight;
      };
      this.wsEsp1.onerror = e => log.error("WS-ESP1 error", e);
      this.wsEsp1.onclose = () => consoleEl.innerHTML += "[WS-ESP1] déconnecté<br>";
    }
  /*
    // 2) WebSocket Raspiz audio (port 8765)
    if (!this.wsRaspiz) {
      this.wsRaspiz = new WebSocket(window.RASPIZ_WS);
      this.wsRaspiz.onopen = () => {
        consoleEl.innerHTML += "[WS-Raspiz] audio stream connecté<br>";
        consoleEl.scrollTop = consoleEl.scrollHeight;
      };
      this.wsRaspiz.onmessage = evt => {
        // Ici on reçoit sûrement du binaire (flux audio), on affiche la taille
        if (typeof evt.data === "string") {
          consoleEl.innerHTML += `[RASPIZ:MSG] ${evt.data}<br>`;
        } else {
          consoleEl.innerHTML += `[RASPIZ:BIN] ${evt.data.byteLength} octets<br>`;
        }
        consoleEl.scrollTop = consoleEl.scrollHeight;
      };
      this.wsRaspiz.onerror = e => log.error("WS-Raspiz error", e);
      this.wsRaspiz.onclose = () => consoleEl.innerHTML += "[WS-Raspiz] déconnecté<br>";
    }
*/
    // 3) Socket.IO Raspiz (événements BT en temps réel)
    if (!this.ioRaspiz) {
      this.ioRaspiz = io(window.RASPIZ_SOCKET);
      this.ioRaspiz.on("connect", () => {
        consoleEl.innerHTML += "[Socket.IO] connecté à Raspiz<br>";
        consoleEl.scrollTop = consoleEl.scrollHeight;
      });
      this.ioRaspiz.on("bt_device", dev => {
        consoleEl.innerHTML += `[Raspiz BT-DEV] ${dev.name||dev.mac} (${dev.mac})<br>`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
      });
      this.ioRaspiz.on("bt_scan", status => {
        consoleEl.innerHTML += `[Raspiz BT-SCAN] ${status.status || status}<br>`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
      });
      this.ioRaspiz.on("disconnect", () => {
        consoleEl.innerHTML += "[Socket.IO] déconnecté<br>";
        consoleEl.scrollTop = consoleEl.scrollHeight;
      });
    }
  },

  clear() {
    document.getElementById("uart_errors").innerHTML = "";
    document.getElementById("console_log").innerHTML  = "";
  }
};
