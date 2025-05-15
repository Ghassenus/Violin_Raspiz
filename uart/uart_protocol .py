# uart_protocol.py

from enum import Enum
from typing import Dict, List, Any, Optional


# 🔹 Origine de l’émetteur
class Source(Enum):
    RASPZ = "RASPZ"
    ESP1 = "ESP1"
    ESP2 = "ESP2"


# 🔹 Cible(s) d’un message
class Destination(Enum):
    RASPZ = "RASPZ"
    ESP1 = "ESP1"
    ESP2 = "ESP2"
    ALL = "ALL"  # broadcast


# 🔹 Types de message UART standardisés
class MessageType(Enum):
    # Système
    PING = "PING"
    PONG = "PONG"
    STATUS = "STATUS"
    ACK = "ACK"
    NACK = "NACK"
    UNKNOWN = "UNKNOWN"

    # Réseau
    WIFI_MODE = "WIFI_MODE"              # {"mode": "AP"/"STA"}
    WIFI_CREDENTIALS = "WIFI_CREDENTIALS"  # {"ssid": "...", "password": "..."}

    # Commande globale
    COMMAND = "COMMAND"                  # {"action": "reboot"/"reset"/"start_vision"/...}

    # Audio
    AUDIO_STREAM = "AUDIO_STREAM"        # {"src": "PIEZO"/"JACK"/"FILE", "format": "PCM"}
    AUDIO_CONTROL = "AUDIO_CONTROL"      # {"action": "play"/"stop"/"volup"/"voldown"}

    # Bluetooth
    BT_SCAN = "BT_SCAN"                  # {}
    BT_LIST = "BT_LIST"                  # {"devices": [...]} (réponse)
    BT_CONNECT = "BT_CONNECT"            # {"mac": "..."}
    BT_STATUS = "BT_STATUS"              # {"connected": true, "device": "..."}

    # Vision
    VISION_STATE = "VISION_STATE"        # {"enabled": true}
    VISION_RESULT = "VISION_RESULT"      # {"finger_positions": [...], "frame_id": N}

    # Debug / log
    LOG = "LOG"                          # {"msg": "...", "level": "INFO"/"WARN"/"ERR"}


# 🔸 Champs requis par défaut dans tout message
BASE_FIELDS = ["type", "source", "dest", "payload"]

# 🔸 Payload attendu par type (documentation à usage humain)
PAYLOAD_SPEC: Dict[MessageType, Dict[str, Any]] = {
    MessageType.WIFI_MODE:        {"mode": str},
    MessageType.WIFI_CREDENTIALS: {"ssid": str, "password": str},
    MessageType.COMMAND:          {"action": str},
    MessageType.AUDIO_STREAM:     {"src": str, "format": str},
    MessageType.AUDIO_CONTROL:    {"action": str},
    MessageType.BT_CONNECT:       {"mac": str},
    MessageType.BT_STATUS:        {"connected": bool, "device": str},
    MessageType.VISION_STATE:     {"enabled": bool},
    MessageType.VISION_RESULT:    {"finger_positions": list, "frame_id": int},
    MessageType.LOG:              {"msg": str, "level": str}
}

# 🔎 Fonction de validation de structure
def validate_message(msg: Dict[str, Any]) -> Optional[str]:
    """
    Vérifie qu'un message contient les champs standards, un type connu,
    et un payload conforme si défini. Retourne None si OK, ou un message d’erreur.
    """
    for field in BASE_FIELDS:
        if field not in msg:
            return f"Champ manquant: {field}"

    try:
        msg_type = MessageType(msg["type"])
    except ValueError:
        return f"Type de message inconnu: {msg['type']}"

    # Vérification du format du payload
    spec = PAYLOAD_SPEC.get(msg_type)
    if spec:
        for key, expected_type in spec.items():
            if key not in msg["payload"]:
                return f"Champ payload manquant: {key}"
            if not isinstance(msg["payload"][key], expected_type):
                return f"Payload[{key}] invalide: attendu {expected_type.__name__}"

    return None  # OK
