# flask_server.py

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from network import bluetooth_manager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# === Blueprints API ===
from api.routes_bluetooth import bluetooth_api
from api.routes_audio import audio_api
app.register_blueprint(bluetooth_api)
app.register_blueprint(audio_api)

# === REST Simple ===
@app.route('/')
def index():
    return "Bienvenue sur le Raspberry Pi Zero – API active"

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        "status": "ok",
        "source": "Violin_RAPIZ",
        "message": "API opérationnelle"
    })

# === Socket.IO handlers ===
@socketio.on('connect')
def handle_connect():
    print("[WS] ✅ Client Web connecté via Socket.IO")

@socketio.on('disconnect')
def on_disconnect():
    print("[WS] 🔌 Client Socket.IO déconnecté")

@socketio.on("start_scan")
def handle_scan(data=None):
    try:
        print(f"[SOCKET.IO] 🛰️ Scan Bluetooth demandé | data={data}")
        if bluetooth_manager.is_scanning():
            print("[SOCKET.IO] ⚠️ Scan déjà en cours")
        else:
            ok = bluetooth_manager.start_scan()
            print(f"[SOCKET.IO] 🔍 Scan lancé → {ok}")
    except Exception as e:
        print(f"[SOCKET.IO] ❌ Erreur dans handle_scan : {e}")


# === Gestion des erreurs ===
@socketio.on_error_default
def default_error_handler(e):
    print(f"[SOCKET.IO] ❌ Erreur Socket.IO non gérée : {e}")

# === Lancement du serveur ===
def start_flask():
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)

__all__ = ["start_flask", "socketio"]
