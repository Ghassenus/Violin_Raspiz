export function logToTerminal(msg) {
  const log = document.getElementById("terminal_log");
  if (!log) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}
