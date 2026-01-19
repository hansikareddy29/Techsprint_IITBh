import subprocess
import platform
import psutil
import json
import time
import requests
import os

# --- CONFIGURATION ---
# Once Member 2 deploys the backend, update this URL
SERVER_URL = "http://10.50.41.207:8080/api/logs/save" 
DEVICE_ID = f"{platform.node()}_agent"

class VoltGuardAgent:
    def __init__(self):
        self.os_type = platform.system()
        print(f"🚀 VoltGuardAI Agent initialized on {self.os_type}")

    def get_top_apps(self):
        """Identifies the top 5 CPU-consuming apps to distinguish Gaming vs Coding"""
        apps = []
        try:
            proc_list = []
            for p in psutil.process_iter(['name', 'cpu_percent']):
                # Handle cases where CPU percent might be None
                cpu = p.info['cpu_percent'] if p.info['cpu_percent'] is not None else 0.0
                proc_list.append({'name': p.info['name'], 'cpu': cpu})
            
            # Sort by CPU usage and filter out system background tasks
            sorted_procs = sorted(proc_list, key=lambda x: x['cpu'], reverse=True)
            for info in sorted_procs:
                name = info['name']
                if name not in ['kernel_task', 'WindowServer', 'psutil', 'root', 'Idle', 'System Idle Process']:
                    apps.append(name)
                if len(apps) >= 5: break
        except Exception:
            pass
        return apps

    def get_mac_thermal_state(self):
        """Mac specific: Detects thermal pressure (Nominal, Fair, Serious, Critical)"""
        try:
            out = subprocess.check_output(["pmset", "-g", "therm"]).decode("utf-8")
            for line in out.split('\n'):
                if "Thermal pressure" in line:
                    return line.split('is')[-1].strip()
            return "Nominal"
        except:
            return "N/A"

    def get_mac_hardware_data(self, stats):
        """Deep hardware extraction for macOS"""
        try:
            raw = subprocess.check_output(["system_profiler", "SPPowerDataType"]).decode("utf-8")
            for line in raw.split("\n"):
                line = line.strip()
                if "Cycle Count" in line: stats["cycles"] = line.split(":")[1].strip()
                if "Maximum Capacity" in line: stats["health"] = line.split(":")[1].strip().replace('%', '')
                if "Condition" in line: stats["condition"] = line.split(":")[1].strip()
                if "Wattage (W)" in line: stats["wattage"] = line.split(":")[1].strip()
            stats["thermal_state"] = self.get_mac_thermal_state()
        except:
            pass
        return stats

    def get_windows_hardware_data(self, stats):
        """Hardware extraction for Windows"""
        try:
            # Get Health via WMIC
            cmd = "WMIC Path Win32_Battery Get EstimatedChargeRemaining, ExpectedLife"
            stats["health_note"] = "Check PowerCfg for detail"
            # In Windows, Cycle counts usually require 'powercfg /batteryreport' (complex to parse in 10 days)
        except:
            pass
        return stats

    def get_android_stats(self):
        """Deep extraction for Android via ADB (USB)"""
        try:
            # Check for ADB devices
            devices = subprocess.check_output(["adb", "devices"]).decode("utf-8")
            if "device" not in devices.split("\n")[1]:
                return None

            a_stats = {"type": "Android", "timestamp": int(time.time())}
            # Battery Level, Temp, Voltage
            raw_batt = subprocess.check_output(["adb", "shell", "dumpsys", "battery"]).decode("utf-8")
            for line in raw_batt.split("\n"):
                line = line.strip()
                if "level:" in line: a_stats["percent"] = line.split(":")[1].strip()
                if "temperature:" in line: a_stats["temp"] = f"{int(line.split(':')[1])/10}°C"
                if "voltage:" in line: a_stats["voltage"] = f"{line.split(':')[1].strip()}mV"
            
            # Top Android App
            raw_top = subprocess.check_output(["adb", "shell", "top", "-n", "1", "-b", "-o", "NAME"]).decode("utf-8")
            a_stats["top_app"] = raw_top.split('\n')[5].strip()
            return a_stats
        except:
            return None

    def collect_full_telemetry(self):
        """Combines all sensors into one AI-Ready JSON"""
        batt = psutil.sensors_battery()
        if not batt:
            return {"error": "No battery detected"}

        # Basic Stats (Cross-platform)
        data = {
            "device_id": DEVICE_ID,
            "os": self.os_type,
            "timestamp": int(time.time()),
            "battery_percent": batt.percent,
            "is_charging": batt.power_plugged,
            "cpu_load": psutil.cpu_percent(interval=1),
            "ram_usage": psutil.virtual_memory().percent,
            "disk_io_mb": round(psutil.disk_io_counters().read_bytes / (1024 * 1024), 2),
            "top_apps": self.get_top_apps(),
            "mac_deep_stats": {},
            "android_connected_stats": self.get_android_stats()
        }

        # OS Specific Deep-Dives
        if self.os_type == "Darwin":
            data["mac_deep_stats"] = self.get_mac_hardware_data({})
        elif self.os_type == "Windows":
            data["windows_stats"] = self.get_windows_hardware_data({})

        return data

    def run(self):
        print(f"VoltGuardAI: Active Monitoring Enabled. Sending to {SERVER_URL}")
        while True:
            payload = self.collect_full_telemetry()
            
            # --- UPDATE THIS PART ---
            print("\n" + "="*50)
            print(f"📊 FULL DATA SNAPSHOT CAPTURED [{time.strftime('%H:%M:%S')}]")
            print("="*50)
            
            # This line will print EVERYTHING (Top Apps, Thermal, Disk, etc.)
            print(json.dumps(payload, indent=4)) 
            
            print("="*50)
            # -------------------------

            try:
                res = requests.post(SERVER_URL, json=payload, timeout=5)
                print(f"✅ Success: Server responded {res.status_code}")
            except:
                print("❌ Offline: Backend unreachable. Saving to local_cache.json")
                with open("local_cache.json", "a") as f:
                    f.write(json.dumps(payload) + "\n")

            # Check every 10 seconds for testing (change to 1800 for final submission)
            time.sleep(10)

if __name__ == "__main__":
    agent = VoltGuardAgent()
    agent.run()