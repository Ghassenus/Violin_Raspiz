# api/flask_server.py
from gevent import monkey
monkey.patch_all(hread=False)

# ——————————————————————————————————————————–
# Silence Gevent’s at-fork-thread assertions (harmless)
try:
    import gevent.threading
    _orig_after = gevent.threading._ForkHooks.after_fork_in_child
    def _safe_after_fork(self):
        try:
            _orig_after(self)
        except AssertionError:
            pass
    gevent.threading._ForkHooks.after_fork_in_child = _safe_after_fork
except (ImportError, AttributeError):
    pass
# ——————————————————————————————————————————–

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from network import bluetooth_manager

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="gevent")

# === Blueprints API ===
from api.routes_bluetooth import bluetooth_api
from api.routes_audio import audio_api
app.register_blueprint(bluetooth_api)
app.register_blueprint(audio_api)

# === REST simple ===
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
    sid = request.sid
    ip  = request.remote_addr
    ua  = request.headers.get('User-Agent')
    ref = request.headers.get('Referer')
    print(f"[WS] ✅ Connexion  sid={sid}  ip={ip}  ua={ua!r}  ref={ref!r}")

@socketio.on('disconnect')
def handle_disconnect(reason):
    sid = request.sid
    print(f"[WS] 🔌 Déconnexion  sid={sid}  reason={reason}")

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

@socketio.on_error_default
def default_error_handler(e):
    print(f"[SOCKET.IO] ❌ Erreur non gérée : {e}")

def start_flask(host='0.0.0.0', port=5000):
    """Démarre Flask + Socket.IO via gevent."""
    socketio.run(app, host=host, port=port, debug=False)

__all__ = ["start_flask", "socketio"]
