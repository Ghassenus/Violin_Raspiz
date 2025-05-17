import { log } from './log.js';

let audioEl;

export default {
  init() {
    audioEl = document.getElementById("audio_player");
    const fileInput = document.getElementById("local_audio_file");
    const urlBtn = document.getElementById("playURL");
    const outputSelect = document.getElementById("audio_output");
    const playBtn = document.getElementById("play");
    const pauseBtn = document.getElementById("pause");

    if (fileInput) fileInput.onchange = (e) => this.uploadLocalAudio(e);
    if (urlBtn) urlBtn.onclick = () => this.playURL();
    if (outputSelect) outputSelect.onchange = () => this.setOutput();
    if (playBtn) playBtn.onclick = () => this.play();
    if (pauseBtn) pauseBtn.onclick = () => this.pause();

    // Mettre à jour le timer pendant la lecture audio
    audioEl.addEventListener('timeupdate', () => {
      const elapsed = Math.floor(audioEl.currentTime);
      const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const sec = Math.floor(elapsed % 60).toString().padStart(2, '0');
      document.getElementById("audio_timer").textContent = `${min}:${sec}`;
    });
    // Réinitialiser lorsque l'audio est terminé
    audioEl.addEventListener('ended', () => {
      document.getElementById("audio_timer").textContent = "00:00";
      const statusEl = document.getElementById("audio_status");
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-secondary">Lecture terminée.</div>`;
      }
      audioEl.currentTime = 0;
    });
  },

  uploadLocalAudio(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Arrêter l'audio courant s'il y en a un
    audioEl.pause();
    audioEl.currentTime = 0;
    // Charger le fichier local dans le player audio
    const url = URL.createObjectURL(file);
    audioEl.src = url;
    const statusEl = document.getElementById("audio_status");
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-success">📂 Fichier "${file.name}" chargé. Appuyez sur Play pour lire.</div>`;
    }
    log.info("📂 Fichier audio local chargé");
  },

  playURL() {
    const url = document.getElementById("url_input").value.trim();
    if (!url) return;
    // Arrêter l'audio courant s'il y en a un
    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.src = url;
    const statusEl = document.getElementById("audio_status");
    audioEl.play().then(() => {
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-success">▶️ Lecture de l'URL en cours...</div>`;
      }
      log.info(`▶️ Lecture URL: ${url}`);
    }).catch(err => {
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-danger">❌ Échec de lecture de l'URL.</div>`;
      }
      log.error("Échec lecture URL: " + err);
    });
  },

  setOutput() {
    const target = document.getElementById("audio_output").value;
    const statusEl = document.getElementById("audio_status");
    if (statusEl) {
      let targetLabel = target;
      if (target === "both") targetLabel = "les deux sorties";
      statusEl.innerHTML = `<div class="alert alert-info">🎧 Sortie audio réglée : ${targetLabel}</div>`;
    }
    log.info(`🎧 Sortie audio définie sur ${target}`);
  },

  play() {
    if (!audioEl.src) {
      const statusEl = document.getElementById("audio_status");
      if (statusEl) {
        statusEl.innerHTML = `<div class="alert alert-warning">Aucune source audio sélectionnée.</div>`;
      }
      return;
    }
    audioEl.play().catch(err => {
      log.error("Erreur lecture audio: " + err);
    });
    const statusEl = document.getElementById("audio_status");
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-success">Lecture en cours...</div>`;
    }
    log.info("Lecture audio démarrée");
  },

  pause() {
    if (!audioEl.src) return;
    audioEl.pause();
    const statusEl = document.getElementById("audio_status");
    if (statusEl) {
      statusEl.innerHTML = `<div class="alert alert-secondary">Audio en pause.</div>`;
    }
    log.info("Lecture audio en pause");
  }
};
