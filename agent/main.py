import os
import subprocess
import platform
import psutil
import time
import requests

# 1. Ensure this matches your ACTUAL backend URL
SERVER_URL = "https://voltguard-backend.onrender.com/api/logs/save"


class VoltGuardAgent:
    def __init__(self):
        self.os_type = platform.system()
        default_name = platform.node()

        # Unique per device (optional override)
        self.device_name = os.getenv("VOLTGUARD_DEVICE_ID", default_name)

        # Unique per user/browser (MUST be set by each user)
        self.user_token = os.getenv("VOLTGUARD_USER_TOKEN", "").strip()

        print(f"🚀 VoltGuard Agent initialized on {self.device_name} ({self.os_type})")
        if not self.user_token:
            print("⚠️ VOLTGUARD_USER_TOKEN is not set. "
                  "Set it to a secret token to link this device to your dashboard user.")

    def get_hardware_data(self):
        hw = {"cycles": 0, "health": 100}
        try:
            if self.os_type == "Darwin":  # MacOS
                raw = subprocess.check_output(
                    ["system_profiler", "SPPowerDataType"]
                ).decode("utf-8")
                for line in raw.split("\n"):
                    if "Cycle Count" in line:
                        hw["cycles"] = int(line.split(":")[1].strip())
                    if "Maximum Capacity" in line:
                        hw["health"] = int(
                            line.split(":")[1].strip().replace('%', '')
                        )
            elif self.os_type == "Windows":
                raw = subprocess.check_output(
                    "wmic PATH Win32_Battery Get EstimatedChargeRemaining",
                    shell=True
                ).decode("utf-8")
                hw["health"] = int(raw.split('\n')[1].strip())
        except:
            pass
        return hw

    def get_real_apps(self):
        IGNORE_EXACT = [
            'kernel_task', 'launchd', 'WindowServer', 'mds', 'mdworker', 'mds_stores',
            'opendirectoryd', 'powerd', 'configd', 'UserEventAgent', 'iconservicesagent',
            'cfprefsd', 'distnoted', 'locationd', 'sharingd', 'tccd', 'softwareupdated',
            'trustd', 'accountsd', 'syspolicyd', 'nsurlsessiond', 'amfid', 'bird', 'cloudd',
            'System Idle Process', 'System', 'Registry', 'smss.exe', 'csrss.exe',
            'wininit.exe', 'services.exe', 'lsass.exe', 'svchost.exe', 'winlogon.exe',
            'dwm.exe', 'RuntimeBroker.exe', 'SearchIndexer.exe', 'TaskHost.exe',
            'WmiPrvSE.exe', 'ctfmon.exe', 'conhost.exe', 'dllhost.exe', 'sihost.exe',
            'MpCmdRun.exe', 'MsMpEng.exe', 'SearchHost.exe', 'SearchIndexer.exe',
            'systemd', 'kthreadd', 'kworker', 'ksoftirqd', 'migration', 'rcu_sched',
            'kdevtmpfs', 'cpuhp', 'bash', 'sh', 'zsh', 'login', 'python', 'python3',
            'pythonw.exe', 'node', 'npm', 'pip'
        ]
        IGNORE_KEYWORDS = [
            'helper', 'renderer', 'service', 'daemon',
            'extension', 'com.apple', 'provider', 'broker'
        ]

        for proc in psutil.process_iter(['cpu_percent']):
            try:
                proc.info['cpu_percent']
            except:
                pass
        time.sleep(1)

        apps = []
        for proc in psutil.process_iter(['name', 'cpu_percent']):
            try:
                name = proc.info.get('name')
                cpu = proc.info.get('cpu_percent')
                if name and cpu is not None and cpu > 0.5:
                    name_lower = name.lower()
                    if name in IGNORE_EXACT or any(
                        key in name_lower for key in IGNORE_KEYWORDS
                    ):
                        continue
                    apps.append({"name": name, "cpu": cpu})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        sorted_apps = sorted(apps, key=lambda x: x['cpu'], reverse=True)
        return [p['name'].capitalize() for p in sorted_apps[:3]]

    def collect(self):
        cpu_total = psutil.cpu_percent(interval=1)
        batt = psutil.sensors_battery()
        hw = self.get_hardware_data()

        try:
            public_ip = requests.get('https://api.ipify.org', timeout=5).text
        except:
            public_ip = "127.0.0.1"

        return {
            "deviceId": self.device_name,
            "userToken": self.user_token,
            "os": self.os_type,
            "ipAddress": public_ip,
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
                requests.post(SERVER_URL, json=data, timeout=5)
                print(
                    f"✅ Telemetry Sent: {data['deviceId']} | userToken: {self.user_token[:6]}..."
                )
            except Exception as e:
                print(f"❌ Server Connection Error: {e}")
            time.sleep(60)


if __name__ == "__main__":
    VoltGuardAgent().run()
