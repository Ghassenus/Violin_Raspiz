export default {
  init() {
    document.getElementById("local_audio_file").onchange = this.uploadLocalAudio;
    document.getElementById("playURL").onclick = this.playURL;
    document.getElementById("audio_output").onchange = this.setOutput;
    document.getElementById("play").onclick = this.play;
    document.getElementById("pause").onclick = this.pause;
   // setInterval(this.updateTimer, 1000);
  },

  uploadLocalAudio(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("audio", file);
    fetch(`http://${RASPI_IP}/api/audio/upload`, { method: "POST", body: formData })
      .then(() => log.info("📂 Audio local streamé"))
      .catch(log.error);
  },

  playURL() {
    const url = document.getElementById("url_input").value;
    fetch(`http://${RASPI_IP}/api/audio/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    }).then(() => log.info(`▶️ Lecture URL: ${url}`))
      .catch(log.error);
  },

  setOutput() {
    const target = document.getElementById("audio_output").value;
    fetch(`http://${RASPI_IP}/api/audio/output`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target })
    }).then(() => log.info(`🎧 Sortie audio: ${target}`))
      .catch(log.error);
  },

  play()    { fetch(`http://${RASPI_IP}/api/audio/play`, { method: "POST" }); },
  pause()   { fetch(`http://${RASPI_IP}/api/audio/pause`, { method: "POST" }); },

  updateTimer() {
    fetch(`http://${RASPI_IP}/api/audio/status`)
      .then(r => r.json())
      .then(({ elapsed }) => {
        const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const sec = Math.floor(elapsed % 60).toString().padStart(2, '0');
        document.getElementById("audio_timer").textContent = `${min}:${sec}`;
      });
  }
};
