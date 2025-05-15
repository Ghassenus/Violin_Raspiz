#bluetooth_manager
import os
import subprocess
import threading
import time

_scan_thread = None
_scan_running = False
_scan_results = []
_known_devices = []
_socketio = None
_connected_mac = None
_autoconnect_enabled = True



# 🔌 Injecter le socket
def set_socketio(io):
    global _socketio
    _socketio = io

# ✅ Ajouter un périphérique à l'historique si inconnu
def add_known_device(mac, name):
    if not any(dev["mac"] == mac for dev in _known_devices):
        _known_devices.append({"mac": mac, "name": name})

def get_known_devices():
    return _known_devices

def start_scan():
    global _scan_running, _scan_results
    if _scan_running:
        return False

    subprocess.run(["rfkill", "unblock", "bluetooth"], stdout=subprocess.DEVNULL)
    subprocess.run(["bluetoothctl", "power", "on"], stdout=subprocess.DEVNULL)

    _scan_results = []
    _scan_running = True

    _socketio.start_background_task(_scan_loop)
    _socketio.start_background_task(_stop_scan_delayed)
    return True

def _stop_scan_delayed():
    _socketio.sleep(10)
    stop_scan()

def stop_scan():
    global _scan_running
    _scan_running = False
    subprocess.run(["bluetoothctl", "scan", "off"], stdout=subprocess.DEVNULL)

def is_scanning():
    return _scan_running

def get_scan_results():
    return _scan_results

def connect_device(mac: str) -> bool:
    global _connected_mac
    try:
        process = subprocess.Popen(
            ["bluetoothctl"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True
        )
        if not process.stdin or not process.stdout:
            return False

        def send(cmd, delay=0.4):
            process.stdin.write(cmd + "\n")
            process.stdin.flush()
            time.sleep(delay)

        print(f"[BLUETOOTH] 🔄 Tentative de connexion à {mac}...")

        # Activation et configuration agent
        send("agent NoInputNoOutput")
        send("default-agent")
        send("power on")
        send("scan on")
        send(f"trust {mac}")
        send(f"pair {mac}")

        connected = False
        for _ in range(30):  # attend ~12 secondes max
            line = process.stdout.readline()
            print("[BTCTL]", line.strip())

            if "Pairing successful" in line or "Connection successful" in line or "Connected: yes" in line:
                connected = True
                break
            elif "Failed to pair" in line or "AuthenticationFailed" in line:
                print("[BLUETOOTH] ❌ Pairing échoué ou rejeté")
                break

        if connected:
            send(f"connect {mac}")
            for _ in range(10):
                line = process.stdout.readline()
                print("[BTCTL]", line.strip())
                if "Connection successful" in line or "Connected: yes" in line:
                    break

        process.terminate()

        if connected:
            _connected_mac = mac
            print(f"[BLUETOOTH] ✅ Appairé & connecté à {mac}")
            return True
        else:
            print(f"[BLUETOOTH] ❌ Connexion à {mac} échouée. Enceinte prête ?")
            return False

    except Exception as e:
        print(f"[BLUETOOTH] ❌ Erreur pendant la connexion : {e}")
        return False




def disconnect_device() -> bool:
    global _connected_mac
    if not _connected_mac:
        return False
    try:
        subprocess.run(["bluetoothctl", "disconnect", _connected_mac], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[BLUETOOTH] 🔌 Déconnecté de {_connected_mac}")
        _connected_mac = None
        return True
    except Exception as e:
        print(f"[BLUETOOTH] ❌ Échec de déconnexion : {e}")
        return False

def get_connected_device() -> str | None:
    return _connected_mac
                    

def _scan_loop():
    global _scan_running

    print("[SCAN LOOP] 🔍 Début boucle scan Bluetooth")
    connected_macs = get_connected_devices()

    if _socketio:
        _socketio.start_background_task(lambda: _socketio.emit("bt_scan", {"status": "started"}))

    process = subprocess.Popen(
        ["bluetoothctl"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True
    )

    if not process.stdin or not process.stdout:
        _scan_running = False
        return

    process.stdin.write("scan on\n")
    process.stdin.flush()

    while _scan_running:
        line = process.stdout.readline()
        print("[RAW]", line.strip())
        print("🧪 [DEBUG LINE] →", repr(line))

        if "Device" in line and "NEW" in line:
            print("📡 [DEBUG] Nouvelle ligne détectée avec NEW DEVICE")
            parts = line.strip().split()
            if len(parts) >= 4:
                mac = parts[2]
                name = " ".join(parts[3:])
                entry = {"mac": mac, "name": name, "connected": mac in connected_macs}

                existing_macs = {d["mac"] for d in _scan_results}
                if mac not in existing_macs:
                    _scan_results.append(entry)
                    add_known_device(mac, name)
                    print(f"[SOCKET.IO] Nouveau périphérique : {entry}")
                    if _socketio:
                        print(f"✅ Emit vers Socket.IO : {entry}")
                        _socketio.start_background_task(lambda d=entry: _socketio.emit("bt_device", d))

        time.sleep(0.1)

    process.stdin.write("scan off\n")
    process.stdin.flush()
    process.terminate()

    if _socketio:
        print("[SCAN LOOP] ✅ Scan terminé")
        def emit_end():
            print("[SOCKET.IO] 🔚 Émission de fin de scan")
            _socketio.emit("bt_scan", {"status": "finished"})
        _socketio.start_background_task(emit_end)
        time.sleep(0.2)  # pour laisser le temps à la tâche d’émettre

def is_autoconnect_enabled():
    return _autoconnect_enabled

def set_autoconnect(enabled: bool):
    global _autoconnect_enabled
    _autoconnect_enabled = enabled
    print(f"[BLUETOOTH] ⚙️ AutoConnect: {'activé' if enabled else 'désactivé'}")

def auto_reconnect_last_known():
    if not _autoconnect_enabled:
        print("[BLUETOOTH] ⛔ AutoConnect désactivé. Aucune reconnexion.")
        return
    for dev in reversed(_known_devices):
        mac = dev["mac"]
        print(f"[BLUETOOTH] 🔁 Tentative de reconnexion à {mac}...")
        if connect_device(mac):
            print(f"[BLUETOOTH] ✅ Reconnecté à {mac}")
            break
def get_connected_devices() -> set[str]:
    try:
        out = subprocess.check_output(["bluetoothctl", "devices", "Connected"], text=True)
        return {line.split()[1] for line in out.strip().splitlines() if line.startswith("Device")}
    except Exception as e:
        print(f"[BLUETOOTH] ⚠️ Erreur get_connected_devices: {e}")
        return set()