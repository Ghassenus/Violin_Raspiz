# audio/sources/source_websocket.py
import errno
import asyncio
import threading
from collections import deque

MAX_BUFFER_SIZE = 200
_audio_buffer      = deque(maxlen=MAX_BUFFER_SIZE)
_ws_clients        = set()
_websocket_server  = None

def get_next_chunk():
    """Retourne un chunk audio (bytes) ou None."""
    if _audio_buffer:
        return _audio_buffer.popleft()
    return None

def has_data():
    return len(_audio_buffer) > 0

def clear():
    _audio_buffer.clear()

async def handle_client(reader, writer):
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
    try:
        server = await asyncio.start_server(
            handle_client, host='0.0.0.0', port=port
        )
    except OSError as e:
        if e.errno == errno.EADDRINUSE:
            print(f"[WS-AUDIO] ⚠️ Port {port} occupé, démarrage ignoré.")
            return
        raise
    _websocket_server = server
    print(f"[WS-AUDIO] 🎧 Serveur WebSocket audio actif sur port {port}")
    async with server:
        await server.serve_forever()

def start_async_server():
    """Démarre le serveur audio si pas déjà lancé."""
    global _websocket_server
    if _websocket_server is not None:
        print("[WS-AUDIO] ⚠️ Serveur déjà actif, démarrage ignoré.")
        return
    def _run():
        asyncio.run(start_server())
    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
