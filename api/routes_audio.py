from flask import Blueprint, request, jsonify
from pydub import AudioSegment
from audio import audio_manager

audio_api = Blueprint("audio_api", __name__)

@audio_api.route("/api/audio/upload", methods=["POST"])
def upload_audio():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide"}), 400

    try:
        audio = AudioSegment.from_file(file)
        audio_manager.push_audio("web_upload", audio)
        return jsonify({"status": "uploaded"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
