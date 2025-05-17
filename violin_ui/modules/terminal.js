export default {
  init() {
    const espSocket = new WebSocket(`ws://${ESP1_IP}:81`);
    espSocket.onmessage = event => {
      const msg = JSON.parse(event.data);
      this.appendUartError(msg.data);
    };
  },

  appendUartError(msg) {
    const logEl = document.getElementById("uart_errors");
    const div = document.createElement("div");
    div.textContent = "[UART ERROR] " + msg;
    logEl.appendChild(div);
  }
};
