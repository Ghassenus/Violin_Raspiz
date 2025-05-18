import os
import json
import socket
import subprocess
import threading
import time

MPV_SOCKET = "/tmp/mpv_socket"
MPV_PROCESS = None
socketio = None  # Injecté par init_socketio

def init_socketio(sockio):
    global socketio
    socketio = sockio

def wait_for_mpv_socket(timeout=4.0):
    t0 = time.time()
    while not os.path.exists(MPV_SOCKET) and (time.time() - t0) < timeout:
        time.sleep(0.05)
    return os.path.exists(MPV_SOCKET)

def send_command(cmd, retry=3):
    for _ in range(retry):
        if wait_for_mpv_socket():
            try:
                with socket.socket(socket.AF_UNIX) as s:
                    s.connect(MPV_SOCKET)
                    s.send((json.dumps(cmd) + "\n").encode())
                return True
            except Exception as e:
                print(f"[AUDIO] ❌ IPC command failed: {e}")
                time.sleep(0.2)
        else:
            time.sleep(0.1)
    print("[AUDIO] MPV socket non prêt après retries.")
    return False

def launch_audio(path_or_url, extra_args=None):
    """Joue un fichier ou une URL (YouTube) avec MPV IPC."""
    global MPV_PROCESS
    stop()
    if os.path.exists(MPV_SOCKET):
        os.remove(MPV_SOCKET)
    cmd = [
        "mpv",
        "--no-terminal",
        "--input-ipc-server=" + MPV_SOCKET,
        "--volume=60",
        "--idle=yes",
        "--force-window=no"
    ]
    if extra_args:
        cmd += extra_args
    cmd.append(path_or_url)
    try:
        MPV_PROCESS = subprocess.Popen(cmd)
        wait_for_mpv_socket()
        start_status_reporter()
        return True
    except Exception as e:
        print(f"[AUDIO] ❌ Erreur lancement MPV: {e}")
        return False

def stop():
    global MPV_PROCESS
    send_command({"command": ["quit"]})
    if MPV_PROCESS and MPV_PROCESS.poll() is None:
        MPV_PROCESS.terminate()
        MPV_PROCESS = None

def pause():     return send_command({"command": ["cycle", "pause"]})
def vol_up():    return send_command({"command": ["add", "volume", 5]})
def vol_down():  return send_command({"command": ["add", "volume", -5]})

def toggle_mute():
    # Récupère état mute et inverse
    state = get_mpv_state()
    is_muted = state.get("mute", False) if state else False
    return send_command({"command": ["set_property", "mute", not is_muted]})

def mute():      return send_command({"command": ["set_property", "mute", True]})
def unmute():    return send_command({"command": ["set_property", "mute", False]})

# ===============================
# Boucle de reporting MPV -> Socket.IO
# ===============================
_reporter_running = False

def start_status_reporter():
    global _reporter_running
    if _reporter_running: return
    _reporter_running = True
    thread = threading.Thread(target=_status_report_loop, daemon=True)
    thread.start()

def _status_report_loop():
    global _reporter_running
    last_status = {}
    while _reporter_running:
        state = get_mpv_state()
        if socketio and state:
            if state != last_status:
                try:
                    socketio.emit("audio_status", state)
                except TypeError:
                    socketio.emit("audio_status", state, broadcast=True)
                last_status = state
        time.sleep(0.5)

def get_mpv_state():
    """Récupère toutes les infos MPV nécessaires pour l’UI."""
    if not wait_for_mpv_socket(0.2):
        return None
    props = [
        "pause", "duration", "time-pos", "volume", "mute", "media-title",
        "core-idle", "percent-pos", "demuxer-cache-time", "filename"
    ]
    status = {}
    for prop in props:
        value = mpv_get_property(prop)
        if value is not None:
            status[prop] = value
    # Ajout logique supplémentaire
    status["state"] = (
        "paused" if status.get("pause") else
        "idle" if status.get("core-idle") else
        "playing"
    )
    # Human readables
    if "duration" in status and "time-pos" in status:
        duration = status["duration"] or 0
        elapsed = status["time-pos"] or 0
        status["elapsed_fmt"] = _fmt_time(elapsed)
        status["duration_fmt"] = _fmt_time(duration)
        status["remaining_fmt"] = _fmt_time((duration - elapsed) if duration else 0)
    if "volume" in status:
        status["volume_percent"] = int(status["volume"])
    # Titre enrichi
    if "media-title" in status and status["media-title"]:
        status["title"] = status["media-title"]
    elif "filename" in status:
        status["title"] = os.path.basename(status["filename"])
    return status

def _fmt_time(sec):
    try:
        sec = int(sec)
        return f"{sec//60:02}:{sec%60:02}"
    except Exception:
        return "00:00"

def mpv_get_property(name):
    resp = mpv_query({"command": ["get_property", name]})
    if resp and "data" in resp:
        return resp["data"]
    return None

def mpv_query(cmd):
    if not wait_for_mpv_socket(0.2):
        return None
    try:
        with socket.socket(socket.AF_UNIX) as s:
            s.connect(MPV_SOCKET)
            s.send((json.dumps(cmd) + "\n").encode())
            s.settimeout(0.2)
            resp = b""
            while True:
                try:
                    chunk = s.recv(4096)
                    if not chunk:
                        break
                    resp += chunk
                    if b"\n" in resp:
                        break
                except socket.timeout:
                    break
            if resp:
                return json.loads(resp.decode().splitlines()[0])
    except Exception as e:
        print(f"[AUDIO] ❌ mpv_query failed: {e}")
    return None

def shutdown_reporter():
    global _reporter_running
    _reporter_running = False

def is_mpv_running():
    global MPV_PROCESS
    return MPV_PROCESS and MPV_PROCESS.poll() is None

def is_paused():
    return get_mpv_state().get("pause", False)