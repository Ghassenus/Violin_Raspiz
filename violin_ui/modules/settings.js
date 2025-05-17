import { log } from './log.js';

export default {
  init() {
    // Date
    document.getElementById("set_date").onclick = () => this.setDate();

    // Heure & format
    document.getElementById("set_time").onclick = () => this.setTimeAndFormat();

    // Slider luminosité
    const slider = document.getElementById("brightness_slider");
    const label  = document.getElementById("brightness_label");
    if (slider && label) {
      slider.oninput = () => { label.textContent = slider.value + " %"; };
    }
    document.getElementById("set_brightness").onclick = () => this.setBrightness();
  },

  setDate() {
    const dayEl   = document.getElementById("day_input");
    const monEl   = document.getElementById("month_input");
    const yearEl  = document.getElementById("year_input");
    const msgEl   = document.getElementById("settings_status");

    const day   = parseInt(dayEl.value, 10);
    const month = parseInt(monEl.value, 10);
    const year  = parseInt(yearEl.value, 10);

    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12) {
      msgEl.innerHTML = `<div class="alert alert-warning">⚠️ Date invalide.</div>`;
      return;
    }

    // Mise à jour du statut simulé
    if (window.deviceStatus) {
      window.deviceStatus.day   = day;
      window.deviceStatus.month = month;
      window.deviceStatus.year  = year;
    }

    msgEl.innerHTML = `<div class="alert alert-success">✅ Date fixée au ${day.toString().padStart(2,'0')}/` +
                      `${month.toString().padStart(2,'0')}/${year}.</div>`;
    log.info(`Date définie à ${day}/${month}/${year}`);
    setTimeout(() => { msgEl.innerHTML = ""; }, 4000);
  },

  setTimeAndFormat() {
    const hrEl      = document.getElementById("hour_input");
    const minEl     = document.getElementById("minute_input");
    const fmt24El   = document.getElementById("format24");
    const fmt12El   = document.getElementById("format12");
    const msgEl     = document.getElementById("settings_status");

    const h = parseInt(hrEl.value, 10);
    const m = parseInt(minEl.value, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      msgEl.innerHTML = `<div class="alert alert-warning">⚠️ Heure invalide.</div>`;
      return;
    }

    // Format choisi
    const fmt = fmt12El.checked ? 12 : 24;

    // Mise à jour du statut simulé
    if (window.deviceStatus) {
      window.deviceStatus.hour  = h;
      window.deviceStatus.minute = m;
      window.deviceStatus.fmt24h = (fmt === 24);
    }

    msgEl.innerHTML = `<div class="alert alert-success">✅ Heure fixée à ` +
      `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')} ` +
      `en format ${fmt} h.</div>`;
    log.info(`Heure définie à ${h}:${m}, format ${fmt}h`);
    setTimeout(() => { msgEl.innerHTML = ""; }, 4000);
  },

  setBrightness() {
    const percent = document.getElementById("brightness_slider").value;
    const msgEl   = document.getElementById("settings_status");
    if (window.deviceStatus) {
      // (éventuellement stocker dans deviceStatus)
      window.deviceStatus.brightness = percent;
    }
    msgEl.innerHTML = `<div class="alert alert-success">🔆 Luminosité réglée à ${percent}%</div>`;
    log.info(`Luminosité définie à ${percent}%`);
    setTimeout(() => { msgEl.innerHTML = ""; }, 4000);
  }
};
