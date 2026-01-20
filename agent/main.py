import subprocess
import platform
import psutil
import json
import time
import requests

# --- CONFIGURATION ---
# Because of network_mode: "host" in Docker, we MUST use localhost
SERVER_URL = "http://localhost:8080/api/logs/save" 
DEVICE_ID = "Harshithas-MacBook-Pro.local_agent" 

class VoltGuardAgent:
    def collect_full_telemetry(self):
        batt = psutil.sensors_battery()
        # Fallback for Docker/Windows environment
        percent = batt.percent if batt else 75
        is_charging = batt.power_plugged if batt else False

        return {
            "deviceId": DEVICE_ID,
            "health": 92, # Hardcoded for demo
            "level": percent,
            "battery_percent": percent,
            "is_charging": is_charging,
            "cpu_load": psutil.cpu_percent(interval=1),
            "cycles": 142,
            "condition": "Normal",
            "top_apps": ["VS Code", "Chrome", "Docker"]
        }

    def run(self):
        print(f"🚀 Agent started. Sending data to {SERVER_URL}...")
        while True:
            payload = self.collect_full_telemetry()
            try:
                res = requests.post(SERVER_URL, json=payload, timeout=5)
                print(f"✅ Success: {payload['level']}% | Server Responded: {res.status_code}")
            except Exception as e:
                print(f"❌ Connection Failed: {e}")
            time.sleep(10)

if __name__ == "__main__":
    VoltGuardAgent().run()