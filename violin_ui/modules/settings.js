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
  const payload = {
    day:   +document.getElementById("day_input").value,
    month: +document.getElementById("month_input").value,
    year:  +document.getElementById("year_input").value
  };
  fetch(`${window.ESP1_URL}/api/params/date`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(r => r.ok
         ? this._show("alert-success","Date mise à jour")
         : this._show("alert-danger","Erreur date"))
    .catch(e => this._show("alert-danger",e));
  },

  setTimeAndFormat() {
    const payload = {
      hour:   +document.getElementById("hour_input").value,
      minute: +document.getElementById("minute_input").value,
      "24h":   document.getElementById("format24").checked
    };
    fetch(`${window.ESP1_URL}/api/params/format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.ok
          ? this._show("alert-success","Heure et format mis à jour")
          : this._show("alert-danger","Erreur format"))
      .catch(e => this._show("alert-danger",e));

    // Ensuite on fixe l’heure
    fetch(`${window.ESP1_URL}/api/params/time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hour: payload.hour, minute: payload.minute })
    })
      .then(r => r.ok
          ? this._show("alert-success","Heure mise à jour")
          : this._show("alert-danger","Erreur heure"))
      .catch(e => this._show("alert-danger",e));
  },

  setBrightness() {
    const pct = +document.getElementById("brightness_slider").value;
    fetch(`${window.ESP1_URL}/api/params/brightness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: pct })
    })
      .then(r => r.ok
          ? this._show("alert-success",`Luminosité à ${pct}%`)
          : this._show("alert-danger","Erreur luminosité"))
      .catch(e => this._show("alert-danger",e));
  },

  _show(type, msg) {
    const el = document.getElementById("settings_status");
    el.innerHTML = `<div class="alert ${type}">${msg}</div>`;
    setTimeout(() => el.innerHTML = "", 4000);
  }
};
