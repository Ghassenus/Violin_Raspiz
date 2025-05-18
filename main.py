# main.py
import time
import threading
from utils.logger import log
from api.flask_server import start_flask, socketio
from network import bluetooth_manager
from audio.sources import source_websocket

def main():
    log("=== RaspZ Orchestrator démarré ===")

    # 1) Thread Flask + Socket.IO
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # petit délai pour que Flask soit up
    time.sleep(1)

    # injection de socketio dans le manager Bluetooth
    bluetooth_manager.set_socketio(socketio)

    # 2) Serveur audio WebSocket
    source_websocket.start_async_server()

    # Boucle principale
    while True:
        log("RaspZ actif… en attente.")
        time.sleep(30)

if __name__ == "__main__":
    main()
