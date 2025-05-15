import os
import json
import socket
import subprocess
import threading

MPV_SOCKET = "/tmp/mpv_socket"
MPV_PROCESS = None

def launch_audio(path="/home/pi/test.mp3"):
    global MPV_PROCESS

    if os.path.exists(MPV_SOCKET):
        os.remove(MPV_SOCKET)

    cmd = [
        "mpv",
        "--no-terminal",
        f"--input-ipc-server={MPV_SOCKET}",
        "--volume=60",
        path
    ]
    MPV_PROCESS = subprocess.Popen(cmd)
    return True

def send_command(cmd):
    if not os.path.exists(MPV_SOCKET):
        return False
    try:
        with socket.socket(socket.AF_UNIX) as s:
            s.connect(MPV_SOCKET)
            s.send((json.dumps(cmd) + "\n").encode())
        return True
    except Exception as e:
        print(f"[AUDIO] ❌ IPC command failed: {e}")
        return False

def pause(): return send_command({"command": ["cycle", "pause"]})
def vol_up(): return send_command({"command": ["add", "volume", 5]})
def vol_down(): return send_command({"command": ["add", "volume", -5]})
def seek_forward(): return send_command({"command": ["seek", 10]})
def seek_backward(): return send_command({"command": ["seek", -10]})
def stop(): return send_command({"command": ["quit"]})
