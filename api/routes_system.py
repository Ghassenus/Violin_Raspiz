# api/routes_system.py

from flask import Blueprint, jsonify
import psutil
import subprocess

system_api = Blueprint('system_api', __name__, url_prefix='/api/system')

@system_api.route('/status', methods=['GET'])
def system_status():
    # CPU
    cpu_percent = psutil.cpu_percent(interval=0.5)

    # Mémoire
    vm = psutil.virtual_memory()
    memory = {
        "total": vm.total,
        "used": vm.used,
        "free": vm.available,
        "percent": vm.percent
    }

    # Disque
    du = psutil.disk_usage('/')
    disk = {
        "total": du.total,
        "used": du.used,
        "free": du.free,
        "percent": du.percent
    }

    # Température CPU & tension d’alim (RaspPi)
    cpu_temp = None
    voltage = None
    try:
        out = subprocess.check_output(['vcgencmd', 'measure_temp']).decode()
        # format: temp=48.0'C
        cpu_temp = float(out.split('=')[1].rstrip("'C\n"))
    except Exception:
        pass

    try:
        out = subprocess.check_output(['vcgencmd', 'measure_volts']).decode()
        # format: volt=1.2000V
        voltage = float(out.split('=')[1].rstrip('V\n'))
    except Exception:
        pass

    # Réseau (depuis démarrage)
    net = psutil.net_io_counters()
    network = {
        "bytes_sent": net.bytes_sent,
        "bytes_recv": net.bytes_recv,
        "packets_sent": net.packets_sent,
        "packets_recv": net.packets_recv
    }

    return jsonify({
        "cpu": {"percent": cpu_percent},
        "memory": memory,
        "disk": disk,
        "cpu_temperature_c": cpu_temp,
        "voltage_v": voltage,
        "network": network
    })
