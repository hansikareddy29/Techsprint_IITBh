import subprocess
import platform
import psutil
import json
import time
import requests

SERVER_URL = "http://localhost:8080/api/logs/save" 

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

    # def get_real_apps(self):
    #     """Finds the actual top 3 apps eating CPU right now"""
    #     apps = []
    #     for proc in psutil.process_iter(['name', 'cpu_percent']):
    #         try:
    #             if proc.info['cpu_percent'] > 0: apps.append(proc.info)
    #         except: pass
    #     sorted_apps = sorted(apps, key=lambda x: x['cpu_percent'], reverse=True)
    #     return [p['name'] for p in sorted_apps[:3]]

    # def collect(self):
    #     batt = psutil.sensors_battery()
    #     hw = self.get_hardware_data()
    #     return {
    #         "deviceId": self.device_name,
    #         "os": self.os_type,
    #         "battery_percent": batt.percent if batt else 0,
    #         "is_charging": batt.power_plugged if batt else False,
    #         "cpu_load": psutil.cpu_percent(interval=1),
    #         "ram_usage": psutil.virtual_memory().percent,
    #         "cycles": hw["cycles"],
    #         "health": hw["health"],
    #         "top_apps": self.get_real_apps()
    #     }
    # def get_real_apps(self):
    #     """Finds the actual top 3 apps eating CPU right now"""
    #     # Step 1: Call cpu_percent once for all processes to 'initialize' the counter
    #     for proc in psutil.process_iter(['cpu_percent']):
    #         try:
    #             proc.info['cpu_percent']
    #         except:
    #             pass
        
    #     # Step 2: Wait a very short moment (0.2s) to allow CPU cycles to be measured
    #     time.sleep(0.2)
        
    #     # Step 3: Now get the actual usage
    #     apps = []
    #     for proc in psutil.process_iter(['name', 'cpu_percent']):
    #         try:
    #             # Filter out 'System Idle Process' and ensure it's actually using CPU
    #             if proc.info['name'] != 'System Idle Process' and proc.info['cpu_percent'] > 0:
    #                 apps.append(proc.info)
    #         except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
    #             pass
        
    #     # Step 4: Sort and return top 3
    #     sorted_apps = sorted(apps, key=lambda x: x['cpu_percent'], reverse=True)
    #     top_3 = [p['name'] for p in sorted_apps[:3]]
    #     return top_3

    def get_real_apps(self):
        """Finds top 3 recognizable USER apps, ignoring system noise on Mac, Win, and Linux"""
        
        # Comprehensive cross-platform background noise list
        IGNORE_LIST = [
            # --- WINDOWS ---
            'System Idle Process', 'System', 'Registry', 'svchost.exe', 'lsass.exe', 
            'services.exe', 'wininit.exe', 'csrss.exe', 'smss.exe', 'dwm.exe', 
            'SearchIndexer.exe', 'OneDrive.exe', 'python.exe', 'pythonw.exe', 
            'conhost.exe', 'explorer.exe', 'WmiPrvSE.exe', 'RuntimeBroker.exe',
            'taskhostw.exe', 'dllhost.exe', 'ctfmon.exe', 'ApplicationFrameHost.exe',
            
            # --- MACOS (Darwin) ---
            'kernel_task', 'launchd', 'WindowServer', 'cfprefsd', 'distnoted', 
            'opendirectoryd', 'UserEventAgent', 'configd', 'fseventsd', 
            'diskarbitrationd', 'syspolicyd', 'mds', 'mdworker', 'loginwindow', 
            'Dock', 'SystemUIServer', 'Finder', 'ControlCenter', 'Siri', 
            'NotificationCenter', 'ContextStoreAgent', 'coreaudiod', 'trustd',
            
            # --- LINUX ---
            'systemd', 'kthreadd', 'ksoftirqd', 'kworker', 'rcu_sched', 'rcu_bh', 
            'migration', 'watchdog', 'cpuhp', 'idle_inject', 'dbus-daemon', 
            'rsyslogd', 'systemd-journald', 'systemd-logind', 'systemd-resolved', 
            'agetty', 'cron', 'Xorg', 'gnome-shell', 'dbus-launch'
        ]

        # Initialize CPU counters
        for proc in psutil.process_iter(['cpu_percent']):
            try: proc.info['cpu_percent']
            except: pass
        
        time.sleep(0.2) # Wait for measurement

        apps = []
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                name = proc.info['name']
                cpu = proc.info['cpu_percent']
                
                # Check if process is not in the system ignore list
                if cpu > 0 and name not in IGNORE_LIST:
                    apps.append({"name": name, "cpu": cpu})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by highest CPU consumption
        sorted_apps = sorted(apps, key=lambda x: x['cpu'], reverse=True)
        
        # Clean up the output names for the UI
        # 1. Remove .exe (for Windows)
        # 2. Capitalize (for consistent UI look)
        top_3 = [p['name'].replace('.exe', '').capitalize() for p in sorted_apps[:3]]
        
        return top_3

    def collect(self):
        # Move system cpu_percent call here to ensure it doesn't block get_real_apps
        cpu_total = psutil.cpu_percent(interval=0.5) 
        batt = psutil.sensors_battery()
        hw = self.get_hardware_data()
        
        # Call the fixed app scraper
        apps_list = self.get_real_apps()
        
        return {
            "deviceId": self.device_name,
            "os": self.os_type,
            "battery_percent": batt.percent if batt else 0,
            "is_charging": batt.power_plugged if batt else False,
            "cpu_load": cpu_total,
            "ram_usage": psutil.virtual_memory().percent,
            "cycles": hw["cycles"],
            "health": hw["health"],
            "top_apps": apps_list
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