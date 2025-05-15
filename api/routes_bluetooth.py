#routes_bluetooth
from flask import Blueprint, jsonify, request
from network import bluetooth_manager
import subprocess # juste pour test audio

bluetooth_api = Blueprint('bluetooth_api', __name__)

@bluetooth_api.route('/api/bluetooth/scan/start', methods=['POST'])
def start_scan():
    if bluetooth_manager.is_scanning():
        return jsonify({"status": "already_running"}), 200
    ok = bluetooth_manager.start_scan()
    return jsonify({"status": "started" if ok else "failed"}), 200

@bluetooth_api.route('/api/bluetooth/scan/stop', methods=['POST'])
def stop_scan():
    bluetooth_manager.stop_scan()
    return jsonify({"status": "stopped"}), 200

@bluetooth_api.route('/api/bluetooth/scan/results', methods=['GET'])
def get_results():
    results = bluetooth_manager.get_scan_results()
    return jsonify({"devices": results}), 200

@bluetooth_api.route("/api/bluetooth/history", methods=["GET"])
def bt_history():
    return jsonify({"known": bluetooth_manager.get_known_devices()}), 200

@bluetooth_api.route("/api/bluetooth/connect", methods=["POST"])
def connect():
    data = request.get_json()
    mac = data.get("mac")
    if not mac:
        return jsonify({"error": "MAC address required"}), 400
    success = bluetooth_manager.connect_device(mac)
    return jsonify({"status": "connected" if success else "failed"}), 200

@bluetooth_api.route("/api/bluetooth/disconnect", methods=["POST"])
def disconnect():
    success = bluetooth_manager.disconnect_device()
    return jsonify({"status": "disconnected" if success else "failed"}), 200

@bluetooth_api.route("/api/bluetooth/status", methods=["GET"])
def status():
    mac = bluetooth_manager.get_connected_device()
    return jsonify({"connected_mac": mac}), 200

@bluetooth_api.route("/api/bluetooth/autoconnect", methods=["GET"])
def get_autoconnect():
    return jsonify({"autoconnect": bluetooth_manager.is_autoconnect_enabled()}), 200

@bluetooth_api.route("/api/bluetooth/autoconnect", methods=["POST"])
def set_autoconnect():
    data = request.get_json()
    enabled = data.get("enabled", True)
    bluetooth_manager.set_autoconnect(enabled)
    return jsonify({"autoconnect": enabled}), 

@bluetooth_api.route("/api/bluetooth/status/all", methods=["GET"])
def status_all():
    connected = bluetooth_manager.get_connected_devices()
    known = bluetooth_manager.get_known_devices()
    enriched = []
    for dev in known:
        dev["connected"] = dev["mac"] in connected
        enriched.append(dev)
    return jsonify({"devices": enriched}), 200

@bluetooth_api.route("/api/bluetooth/test_audio", methods=["POST"])
def test_audio():
    try:
        subprocess.Popen(["mpg123", "/home/pi/test.mp3"])
        return jsonify({"status": "playing"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
