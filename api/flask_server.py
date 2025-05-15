#flask_server.py

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from network import bluetooth_manager
from flask_cors import CORS
import threading

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")  # ← SocketIO instance

# Register your routes as before
from api.routes_bluetooth import bluetooth_api
app.register_blueprint(bluetooth_api)

from api.routes_audio import audio_api
app.register_blueprint(audio_api)

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

    
@socketio.on("start_scan")
def handle_scan():
    print("[SOCKET.IO] Scan Bluetooth demandé via socket")
    if bluetooth_manager.is_scanning():
        print("[SOCKET.IO] ⚠️ Scan déjà en cours")
    else:
        ok = bluetooth_manager.start_scan()
        print(f"[SOCKET.IO] 🛰️ Scan démarré : {ok}")

def start_flask():
    socketio.run(app,host='0.0.0.0', port=5000, debug=False)

# === expose socketio pour import externe ===
__all__ = ["start_flask", "socketio"]