# start.py
import eventlet
eventlet.monkey_patch()

import os
import subprocess
import signal
import time

def kill_previous_instances():
    current_pid = os.getpid()

    # 🔪 Tuer les anciennes instances de main.py
    result = subprocess.run(["pgrep", "-f", "main.py"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if result.returncode != 0:
        print("[CLEANUP] ✅ Aucune autre instance main.py à tuer")
    else:
        for pid_str in result.stdout.decode().splitlines():
            pid = int(pid_str)
            if pid != current_pid:
                print(f"[CLEANUP] 🔪 Killing main.py: PID {pid}")
                os.kill(pid, signal.SIGKILL)

    # 🔪 Tuer les anciennes instances de http.server
    result = subprocess.run(["pgrep", "-f", "http.server"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if result.returncode == 0:
        for pid_str in result.stdout.decode().splitlines():
            pid = int(pid_str)
            print(f"[CLEANUP] 🔪 Killing http.server: PID {pid}")
            os.kill(pid, signal.SIGKILL)
    else:
        print("[CLEANUP] ✅ Aucun serveur http.server à tuer")

def launch_http_server():
    ui_path = "/home/pi/violon/violin_ui"
    log_file = "/tmp/http_ui.log"

    print("[HTTP] 🌐 Lancement du serveur Web sur http://<raspi_ip>:8080")
    subprocess.Popen(
        ["python3", "-m", "http.server", "8080"],
        cwd=ui_path,
        stdout=open(log_file, "w"),
        stderr=subprocess.STDOUT
    )

# ---- MAIN ----
if __name__ == "__main__":
    kill_previous_instances()
    time.sleep(0.5)
    launch_http_server()
    time.sleep(1)
    import main
    main.main()
