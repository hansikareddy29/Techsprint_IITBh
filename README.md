# 🔋 VoltGuardAI 
### *AI-Powered Device Longevity & Battery Sustainability Suite*

**VoltGuardAI** is an innovative hardware monitoring platform built for the **Google Open Innovation Challenge**. It bridges the gap between raw hardware telemetry and actionable user insights using **Google Gemini AI** and **Firebase**.

---

## 🚀 The Problem
Battery degradation is a silent killer of electronic devices. Users often see their "Maximum Capacity" drop without understanding why. Existing tools provide **data** (percentage) but lack **insight** (reasons). This leads to premature device replacement and increased e-waste.

## 💡 The Solution
VoltGuardAI acts as a "Hardware Doctor." 
1. **Data Capture:** A background agent extracts deep hardware metrics (Cycles, Voltage, Thermal Pressure, Top CPU Consumers).
2. **Predictive Analysis:** Telemetry is stored in **Google Firebase**.
3. **AI Diagnosis:** **Google Gemini Pro** analyzes trends to identify the **exact reason** for health drops (e.g., thermal stress from specific apps, voltage instability, or poor charging habits).

## 🛠️ Tech Stack

### **Google Technologies (Mandatory Integration)**
*   **Google Gemini AI (1.5 Flash/Pro):** Used for advanced pattern recognition and natural language hardware diagnosis.
*   **Google Firebase (Firestore):** Used as a real-time time-series database for battery telemetry.
*   **Google Firebase Hosting:** Used for deploying the React dashboard.

### **Core Engineering**
*   **Frontend:** React.js, Tailwind CSS, Recharts (Data Visualization).
*   **Backend:** Node.js, Express.js (Modular Architecture).
*   **OS/Hardware Agent:** Python (psutil, subprocess, ADB integration).

## 📁 Project Structure

```text
VoltGuardAI/
├── agent/            # Python Data Extractor (OS/Hardware Layer)
│   ├── main.py       # Cross-platform Mac/Windows/Android script
│   └── requirements.txt
├── server/           # Node.js API (AI & Database Layer)
│   ├── routes/       # Modular Routes (logRoutes, aiRoutes)
│   └── index.js      # Server entry point
└── frontend/         # React Dashboard (UI Layer)
    ├── src/          # App.jsx (Dashboard & Charts)
    └── index.html    # Tailwind CSS integration
✨ Key Features

Deep Telemetry: Captures data points like Cycle Count, Thermal Pressure, and Disk I/O.
App-Aware Diagnosis: Identifies if specific apps (e.g., "VS Code" or "Chrome") are causing battery stress.
Cross-Platform Support: Automated monitoring for macOS/Windows and ADB-based telemetry for Android.
The "Reason" Engine: Uses Gemini AI to provide human-readable explanations for battery health decline.

🏗️ Installation & Setup
1. Agent (Member 1 - Harshitha)
deactivate
cd .\Techsprint_IITBh\
cd agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py

2. Server (Member 2 - Hansika)
deactivate
cd .\Techsprint_IITBh\
cd server
docker stop $(docker ps -aq)  
docker build -t voltguard-backend .
docker run -p 8080:8080 --env GEMINI_API_KEY=AIzaSyA3c4psu96KeYBrUeJTUdOIGfaMC9ZYGZg voltguard-backend

3. Frontend (Member 3 - Suneetha)
deactivate
cd .\Techsprint_IITBh\
cd frontend
docker build -t voltguard-frontend .
docker run -p 3000:5173 voltguard-frontend

👥 The Team (BTech 3rd Year)

    Harshitha: OS Specialist & Data Architect (Member 1).

    Hansika: Backend Engineer & AI Logic Specialist (Member 2).

    Suneetha: Frontend Developer & UI/UX Designer (Member 3).


    










    
