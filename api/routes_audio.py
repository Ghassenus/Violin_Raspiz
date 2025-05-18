import os
import hashlib
from flask import Blueprint, request, jsonify
from audio import audio_controller

audio_api = Blueprint("audio_api", __name__)

UPLOAD_PATH = "/tmp/uploaded.mp3"

def url_to_filename(url):
    h = hashlib.md5(url.encode()).hexdigest()
    return f"/tmp/yt_{h}.mp3"

@audio_api.route("/api/audio/upload", methods=["POST"])
def upload_audio():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400
    file.save(UPLOAD_PATH)
    return jsonify({"status": "uploaded"}), 200

@audio_api.route("/api/audio/youtube", methods=["POST"])
def youtube_audio():
    data = request.get_json()
    url = data.get("url", "")
    stream = data.get("stream", True)
    if not url:
        return jsonify({"error": "URL manquante"}), 400
    if stream:
        ok = audio_controller.launch_audio(url)
        return jsonify({"status": "playing" if ok else "failed"}), 200
    else:
        fname = url_to_filename(url)
        # download here if needed
        return jsonify({"status": "todo"}), 200

@audio_api.route("/api/audio/play", methods=["POST"])
def play_audio():
    data = request.get_json(silent=True) or {}
    src = data.get("source", "upload")  # "upload" ou "youtube"
    url = data.get("url", "")
    # Si MPV tourne
    if audio_controller.is_mpv_running():
        # Si la lecture est en pause : dépauser
        if audio_controller.is_paused():
            audio_controller.pause()  # toggle pause
            return jsonify({"status": "resumed"}), 200
        # Si le fichier courant est le bon (upload) et on n'est pas sur Youtube
        state = audio_controller.get_mpv_state()
        if src == "upload" and state.get("media-title", "").endswith("uploaded.mp3"):
            return jsonify({"status": "already_playing"}), 200
        if src == "youtube" and url and url in state.get("media-title", ""):
            return jsonify({"status": "already_playing"}), 200
        # Sinon, il faut *tuer* et relancer MPV avec le bon fichier
    if src == "youtube" and url:
        ok = audio_controller.launch_audio(url)
    else:
        ok = audio_controller.launch_audio(UPLOAD_PATH)
    return jsonify({"status": "playing" if ok else "failed"}), 200


@audio_api.route("/api/audio/pause", methods=["POST"])
def pause_audio():
    audio_controller.pause()
    return jsonify({"status": "paused"}), 200

@audio_api.route("/api/audio/stop", methods=["POST"])
def stop_audio():
    audio_controller.stop()
    return jsonify({"status": "stopped"}), 200

@audio_api.route("/api/audio/volume", methods=["POST"])
def volume_audio():
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    if action == "up":
        audio_controller.vol_up()
    elif action == "down":
        audio_controller.vol_down()
    elif action == "toggle_mute":
        audio_controller.toggle_mute()
    elif action == "mute":
        audio_controller.mute()
    elif action == "unmute":
        audio_controller.unmute()
    return jsonify({"status": "ok"}), 200
