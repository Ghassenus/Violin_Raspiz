# audio/sources/source_websocket.py

import asyncio
from collections import deque

# Taille max du buffer audio (en nombre de chunks)
MAX_BUFFER_SIZE = 200  # à ajuster selon latence/qualité

# Buffer circulaire des chunks audio PCM (bytes)
_audio_buffer = deque(maxlen=MAX_BUFFER_SIZE)

# WebSocket Server (à intégrer dans flask_server.py ou serveur dédié)
# Ce module fournit juste la logique
_ws_clients = set()
_websocket_server = None  # Reference globale pour arrêt propre

# === API utilisable par audio_manager ===

def get_next_chunk():
    """Retourne un chunk audio (bytes) ou None s'il n'y en a pas."""
    if _audio_buffer:
        return _audio_buffer.popleft()
    return None

def has_data():
    return len(_audio_buffer) > 0

def clear():
    """Vide le buffer audio"""
    _audio_buffer.clear()

# === Setup WebSocket serveur asyncio (à appeler au démarrage) ===

async def handle_client(reader, writer):
    """Gère un nouveau client ESP WebSocket"""
    peer = writer.get_extra_info("peername")
    print(f"[WS-AUDIO] 🔌 Client connecté : {peer}")
    _ws_clients.add(writer)
    try:
        while True:
            data = await reader.read(1024)
            if not data:
                break
            _audio_buffer.append(data)
    except Exception as e:
        print(f"[WS-AUDIO] ⚠️ Erreur : {e}")
    finally:
        print(f"[WS-AUDIO] ❌ Déconnecté : {peer}")
        _ws_clients.remove(writer)
        writer.close()
        await writer.wait_closed()

async def start_server(port=8765):
    global _websocket_server
    server = await asyncio.start_server(handle_client, host='0.0.0.0', port=port)
    _websocket_server = server
    print(f"[WS-AUDIO] 🎧 Serveur WebSocket audio actif sur port {port}")
    async with server:
        await server.serve_forever()

def start_async_server():
    """Démarre le serveur asyncio dans un thread dédié"""
    import threading
    def _run():
        asyncio.run(start_server())
    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
