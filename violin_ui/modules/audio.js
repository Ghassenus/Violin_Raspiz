import { log } from './log.js';

let muted = false;

export default {
  init() {
    const fileInput   = document.getElementById("local_audio_file");
    const urlBtn      = document.getElementById("playURL");
    const playBtn     = document.getElementById("play");
    const pauseBtn    = document.getElementById("pause");
    const stopBtn     = document.getElementById("stop");
    const volUpBtn    = document.getElementById("volup");
    const volDownBtn  = document.getElementById("voldown");
    const muteToggle  = document.getElementById("mute_toggle");

    if (fileInput)   fileInput.onchange  = (e) => this.uploadLocalAudio(e);
    if (urlBtn)      urlBtn.onclick      = () => this.playURL();
    if (playBtn)     playBtn.onclick     = () => this.play();
    if (pauseBtn)    pauseBtn.onclick    = () => this.pause();
    if (stopBtn)     stopBtn.onclick     = () => this.stop();
    if (volUpBtn)    volUpBtn.onclick    = () => this.volume("up");
    if (volDownBtn)  volDownBtn.onclick  = () => this.volume("down");
    if (muteToggle)  muteToggle.onclick  = () => this.toggleMute();

    // --- Listen to Socket.IO events from backend MPV ---
    if (window.raspSocket) {
      window.raspSocket.on('audio_status', state => {
        this.displayStatus(state);
      });
    }

    this._show("Contrôle audio prêt (tout joue sur le Pi)");
  },

  uploadLocalAudio(e) {
    const file = e.target.files[0];
    const fr   = new FormData();
    fr.append("file", file);
    fetch(`${window.RASPIZ_URL}/api/audio/upload`, {
      method: "POST",
      body: fr
    })
      .then(r => r.json())
      .then(j => this._show(`Upload : ${j.status}`))
      .catch(err => this._show(`❌ ${err}`));
  },

  playURL() {
    const url = document.getElementById("url_input").value;
    fetch(`${window.RASPIZ_URL}/api/audio/youtube`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
      .then(r => r.json())
      .then(j => this._show(`YouTube : ${j.status}`))
      .catch(err => this._show(`❌ ${err}`));
  },

  play() {
    fetch(`${window.RASPIZ_URL}/api/audio/play`, {method: "POST"});
    this._show("▶️ Play envoyé");
  },

  pause() {
    fetch(`${window.RASPIZ_URL}/api/audio/pause`, {method: "POST"});
    this._show("⏸️ Pause envoyé");
  },

  stop() {
    fetch(`${window.RASPIZ_URL}/api/audio/stop`, {method: "POST"});
    this._show("⏹️ Stop envoyé");
  },

  volume(action) {
    fetch(`${window.RASPIZ_URL}/api/audio/volume`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action})
    });
    this._show(`🔊 Volume action: ${action}`);
  },

  toggleMute() {
    const action = muted ? "unmute" : "mute";
    this.volume(action);
    muted = !muted;
    this.updateMuteBtn();
  },

  updateMuteBtn() {
    const muteBtn = document.getElementById("mute_toggle");
    if (muted) {
      muteBtn.innerHTML = "🔈 Unmute";
      muteBtn.classList.remove("btn-secondary");
      muteBtn.classList.add("btn-warning");
    } else {
      muteBtn.innerHTML = "🔇 Mute";
      muteBtn.classList.remove("btn-warning");
      muteBtn.classList.add("btn-secondary");
    }
  },

  // Affichage état MPV/status
  displayStatus(state) {
    // État de lecture
    let etat = "⏳ Inconnu";
    if (state["core-idle"]) {
      etat = "En attente";
    } else if (state.pause) {
      etat = "⏸️ Pause";
    } else {
      etat = state['percent-pos'] > 0 ? "▶️ Lecture" : "🕗 Buffering/Start";
    }
    document.getElementById("audio_etat").innerText = etat;

    // Titre
    document.getElementById("audio_title").innerText = state["media-title"] || "--";

    // Durée, temps joué, restant
    const fmt = (s) => (isNaN(s) || s == null) ? "--" : new Date(s * 1000).toISOString().substr(14, 5);
    const dur = state.duration || 0, pos = state["time-pos"] || 0;
    document.getElementById("audio_duree").innerText = fmt(dur);
    document.getElementById("audio_elapsed").innerText = fmt(pos);
    document.getElementById("audio_rest").innerText = fmt(Math.max(0, dur - pos));

    // Volume
    const vol = state.volume !== undefined ? Math.round(state.volume) + "%" : "--";
    document.getElementById("audio_volume").innerText = vol;

    // Mute
    muted = !!state.mute;
    document.getElementById("audio_muted").innerText = muted ? "Oui" : "Non";
    this.updateMuteBtn();

    // Taux lecture réseau (simulé avec percent-pos et demuxer-cache-time)
    document.getElementById("audio_net").innerText =
      (state["percent-pos"] !== undefined ? Math.round(state["percent-pos"]) + "%" : "--");

    // Buffer audio en secondes (demuxer-cache-time)
    document.getElementById("audio_buffer").innerText =
      state["demuxer-cache-time"] !== undefined ? state["demuxer-cache-time"].toFixed(1) + " s" : "--";
  },

  _show(msg) {
    const statusEl = document.getElementById("audio_status");
    if (statusEl) statusEl.innerHTML = `<div class="alert alert-info">${msg}</div>`;
    log.info(msg);
  }
};
