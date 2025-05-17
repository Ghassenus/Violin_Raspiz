import { log } from './log.js';

export default {
  init() {
    const uartEl    = document.getElementById("uart_errors");
    const consoleEl = document.getElementById("console_log");
    const clearBtn  = document.getElementById("clear_console");

    // Contenu simulé
    if (uartEl) {
      uartEl.innerHTML = "[UART ERROR] Simulation d'erreur UART";
    }
    if (consoleEl) {
      consoleEl.innerHTML = "[INFO] Simulation init console<br>";
    }

    // Lier le bouton "Effacer"
    if (clearBtn) {
      clearBtn.onclick = () => this.clear();
    }
    log.info("Console simulée initialisée");
  },

  clear() {
    const uartEl    = document.getElementById("uart_errors");
    const consoleEl = document.getElementById("console_log");
    if (uartEl)    uartEl.innerHTML = "";
    if (consoleEl) consoleEl.innerHTML = "";
    log.info("Console effacée");
  }
};
