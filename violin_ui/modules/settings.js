export default {
  init() {
    document.getElementById("set_time").onclick = this.setTime;
    document.getElementById("set_brightness").onclick = this.setBrightness;
  },

  setTime() {
    const hour = document.getElementById("hour_input").value;
    const minute = document.getElementById("minute_input").value;
    fetch(`http://${ESP1_IP}/api/params/time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hour, minute })
    }).then(() => log.info(`🕒 Heure définie à ${hour}:${minute}`));
  },

  setBrightness() {
    const percent = document.getElementById("brightness_slider").value;
    fetch(`http://${ESP1_IP}/api/params/brightness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent })
    }).then(() => log.info(`🔆 Luminosité réglée à ${percent}%`));
  }
};
