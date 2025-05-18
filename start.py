# start.py
import os
import subprocess
import signal
import time

def kill_previous_instances():
    current_pid = os.getpid()
    user = os.getlogin()  # e.g. 'pi'

    def kill_matching(prog):
        # pgrep ne renvoie que les processus de l'utilisateur courant
        result = subprocess.run(
            ["pgrep", "-u", user, "-f", prog],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL
        )
        if result.returncode != 0:
            print(f"[CLEANUP] ✅ Aucun {prog} à tuer")
            return
        for pid_str in result.stdout.decode().split():
            pid = int(pid_str)
            if pid == current_pid:
                continue
            try:
                print(f"[CLEANUP] 🔪 Killing {prog}: PID {pid}")
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                print(f"[CLEANUP] ⚠️ PID {pid} introuvable (déjà mort)")
            except PermissionError:
                print(f"[CLEANUP] ⚠️ Pas de permission pour tuer PID {pid}")

    # Tuer main.py et http.server uniquement s’ils vous appartiennent
    kill_matching("main.py")
    kill_matching("http.server")

def launch_http_server():
    ui_path = "/home/pi/violon/violin_ui"
    log_dir = "/home/pi/violon/logs"
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "http_ui.log")

    print("[HTTP] 🌐 Lancement du serveur Web sur http://<raspi_ip>:8080")
    subprocess.Popen(
        ["python3", "-m", "http.server", "8080"],
        cwd=ui_path,
        stdout=open(log_file, "w"),
        stderr=subprocess.STDOUT
    )

if __name__ == "__main__":
    kill_previous_instances()
    time.sleep(0.5)
    launch_http_server()
    time.sleep(1)
    import main
    main.main()
