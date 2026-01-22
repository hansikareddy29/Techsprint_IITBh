import subprocess
import platform
import psutil
import json
import time
import requests

# Use 'localhost' if running locally, or the IP address if running on a network
SERVER_URL = "http://localhost:8080/api/logs/save" 

class VoltGuardAgent:
    def __init__(self):
        self.os_type = platform.system()
        self.device_name = platform.node() # This gets your computer's name (e.g., Harshithas-MacBook)
        print(f"🚀 VoltGuard Agent initialized on {self.os_type} as {self.device_name}")

    def get_hardware_data(self):
        hw = {"cycles": 0, "health": 100}
        try:
            if self.os_type == "Darwin":
                raw = subprocess.check_output(["system_profiler", "SPPowerDataType"]).decode("utf-8")
                for line in raw.split("\n"):
                    if "Cycle Count" in line: hw["cycles"] = int(line.split(":")[1].strip())
                    if "Maximum Capacity" in line: hw["health"] = int(line.split(":")[1].strip().replace('%',''))
            elif self.os_type == "Windows":
                raw = subprocess.check_output("wmic PATH Win32_Battery Get EstimatedChargeRemaining", shell=True).decode("utf-8")
                hw["health"] = int(raw.split('\n')[1].strip())
        except: pass
        return hw

    def get_real_apps(self):
        IGNORE_LIST = ['kernel_task', 'launchd', 'WindowServer', 'python', 'python3', 'System Idle Process']
        
        # Initial call to psutil to start the CPU timer
        for proc in psutil.process_iter(['cpu_percent']):
            try: proc.info['cpu_percent']
            except: pass
        
        time.sleep(0.5) 

        apps = []
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                name = proc.info.get('name')
                cpu = proc.info.get('cpu_percent')
                
                # FIX: Check if cpu is not None and not in ignore list
                if name and cpu is not None and cpu > 0 and name not in IGNORE_LIST:
                    apps.append({"name": name, "cpu": cpu})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        sorted_apps = sorted(apps, key=lambda x: x['cpu'], reverse=True)
        return [p['name'].capitalize() for p in sorted_apps[:3]]

    def collect(self):
        cpu_total = psutil.cpu_percent(interval=1) 
        batt = psutil.sensors_battery()
        hw = self.get_hardware_data()
        
        return {
            "deviceId": self.device_name,
            "os": self.os_type,
            "battery_percent": batt.percent if batt else 0,
            "is_charging": batt.power_plugged if batt else False,
            "cpu_load": cpu_total,
            "ram_usage": psutil.virtual_memory().percent,
            "cycles": hw["cycles"],
            "health": hw["health"],
            "top_apps": self.get_real_apps()
        }

    def run(self):
        while True:
            data = self.collect()
            try:
                response = requests.post(SERVER_URL, json=data, timeout=5)
                print(f"✅ Telemetry Sent to Server: {data['deviceId']} | CPU: {data['cpu_load']}%")
            except Exception as e:
                print(f"❌ Server Connection Error: {e}")
            
            # Update frequency: 10 seconds for testing/sprint demo
            time.sleep(1800)

if __name__ == "__main__":
    VoltGuardAgent().run()