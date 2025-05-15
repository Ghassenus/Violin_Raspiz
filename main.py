#main.py
import time
import threading
from utils.logger import log
from api.flask_server import start_flask, socketio
from network import bluetooth_manager
from audio.sources import source_websocket

def main():
    log("=== RaspZ Orchestrator démarré ===")

    # Lancer le serveur Flask avec SocketIO dans un thread
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # On attend un peu pour s'assurer que Flask est bien lancé
    time.sleep(1)

    # Injecter socketio dans le gestionnaire Bluetooth
    bluetooth_manager.set_socketio(socketio)

    source_websocket.start_async_server()

    while True:
        log("RaspZ actif... en attente.")
        time.sleep(30)

if __name__ == "__main__":
    main()
