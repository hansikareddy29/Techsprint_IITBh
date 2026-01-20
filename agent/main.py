import subprocess
import platform
import psutil
import json
import time
import requests

# --- CONFIGURATION ---
# Replace with Hansika's Cloud URL after deployment
SERVER_URL = "http://10.50.3.159:8080/api/logs/save" 

class VoltGuardAgent:
    def __init__(self):
        self.os_type = platform.system()
        self.device_name = platform.node()
        print(f"🚀 VoltGuard Agent initialized on {self.os_type}")

    def get_hardware_data(self):
        """Scrapes REAL hardware registers based on OS"""
        hw = {"cycles": 0, "health": 100}
        try:
            if self.os_type == "Darwin": # MacOS
                raw = subprocess.check_output(["system_profiler", "SPPowerDataType"]).decode("utf-8")
                for line in raw.split("\n"):
                    if "Cycle Count" in line: hw["cycles"] = int(line.split(":")[1].strip())
                    if "Maximum Capacity" in line: hw["health"] = int(line.split(":")[1].strip().replace('%',''))
            elif self.os_type == "Windows": # Windows
                raw = subprocess.check_output("wmic PATH Win32_Battery Get EstimatedChargeRemaining", shell=True).decode("utf-8")
                hw["health"] = int(raw.split('\n')[1].strip())
        except: pass
        return hw

    def get_real_apps(self):
        """Finds the actual top 3 apps eating CPU right now"""
        apps = []
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                if proc.info['cpu_percent'] > 0: apps.append(proc.info)
            except: pass
        sorted_apps = sorted(apps, key=lambda x: x['cpu_percent'], reverse=True)
        return [p['name'] for p in sorted_apps[:3]]

    def collect(self):
        batt = psutil.sensors_battery()
        hw = self.get_hardware_data()
        return {
            "device_id": self.device_name,
            "os": self.os_type,
            "battery_percent": batt.percent if batt else 0,
            "is_charging": batt.power_plugged if batt else False,
            "cpu_load": psutil.cpu_percent(interval=1),
            "ram_usage": psutil.virtual_memory().percent,
            "cycles": hw["cycles"],
            "health": hw["health"],
            "top_apps": self.get_real_apps()
        }

    def run(self):
        while True:
            data = self.collect()
            try:
                requests.post(SERVER_URL, json=data, timeout=5)
                print(f"✅ Telemetry Sent: CPU {data['cpu_load']}% | Apps: {data['top_apps']}")
            except Exception as e:
                print(f"❌ Server Offline: {e}")
            time.sleep(1800)

if __name__ == "__main__":
    VoltGuardAgent().run()