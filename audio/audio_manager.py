import threading
import time
from pydub import AudioSegment
from pydub.playback import play
from pydub.effects import normalize
from collections import defaultdict
from audio.sources import source_websocket

sources = {
    "local_file": [],
    "web_upload": [],
    "url_stream": [],
    "esp1_bt": [],       # WebSocket
    "esp2_piezo": [],    # WebSocket ou UART plus tard
    "jack_in": []
}

source_settings = defaultdict(lambda: {
    "volume": 1.0,
    "reverb": False,
    "speed": 1.0
})

mixer_running = False
current_output = "bluetooth"  # bluetooth | jack | both

def apply_effects(segment: AudioSegment, settings: dict) -> AudioSegment:
    segment += (settings["volume"] * 10 - 10)  # Gain dB
    if settings["reverb"]:
        segment = normalize(segment)
    if settings["speed"] != 1.0:
        segment = segment._spawn(segment.raw_data, overrides={
            "frame_rate": int(segment.frame_rate * settings["speed"])
        }).set_frame_rate(segment.frame_rate)
    return segment

def mix_sources() -> AudioSegment | None:
    mix = None
    for key, queue in sources.items():
        if key == "esp1_bt" and source_websocket.has_data():
            chunk = source_websocket.get_next_chunk()
            if chunk:
                try:
                    segment = pcm_chunk_to_audio(chunk)
                except Exception as e:
                    print(f"[AUDIO] ❌ Erreur conversion chunk : {e}")
                    continue
            else:
                continue
        elif not queue:
            continue
        else:
            segment = queue.pop(0)

        segment = apply_effects(segment, source_settings[key])
        if mix is None:
            mix = segment
        else:
            mix = mix.overlay(segment)
    return mix

def mixer_loop():
    global mixer_running
    while mixer_running:
        mixed = mix_sources()
        if mixed:
            output_audio(mixed)
        time.sleep(0.05)  # 20 FPS

def output_audio(segment: AudioSegment):
    # Export temporaire vers /tmp
    segment.export("/tmp/mix_out.wav", format="wav")
    if current_output in ["jack", "both"]:
        play(segment)
    if current_output in ["bluetooth", "both"]:
        # TODO : envoyer via BlueALSA, pipe, ou outil spécifique
        pass

def start_mixer():
    global mixer_running
    if not mixer_running:
        mixer_running = True
        threading.Thread(target=mixer_loop, daemon=True).start()

def stop_mixer():
    global mixer_running
    mixer_running = False

def push_audio(source_key: str, audio: AudioSegment):
    if source_key not in sources:
        print(f"[AUDIO] Source inconnue: {source_key}")
        return
    sources[source_key].append(audio)

def set_source_params(source_key: str, volume=1.0, reverb=False, speed=1.0):
    source_settings[source_key] = {
        "volume": volume,
        "reverb": reverb,
        "speed": speed
    }

def set_output_target(target: str):
    global current_output
    if target in ["bluetooth", "jack", "both"]:
        current_output = target

def pcm_chunk_to_audio(chunk: bytes, sample_rate=16000, sample_width=2, channels=1) -> AudioSegment:
    """Convertit un chunk PCM brut en AudioSegment"""
    return AudioSegment(
        data=chunk,
        sample_width=sample_width,
        frame_rate=sample_rate,
        channels=channels
    )

# Nouvelles fonctions de lecture directe
def play_uploaded():
    # Joue le dernier fichier uploadé
    if sources["web_upload"]:
        segment = sources["web_upload"][-1]
        play(segment)

def play_youtube():
    # Joue le dernier stream YouTube
    if sources["url_stream"]:
        segment = sources["url_stream"][-1]
        play(segment)
