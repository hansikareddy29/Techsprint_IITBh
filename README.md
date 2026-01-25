# 🔋 VoltGuardAI 
### *AI-Powered Device Longevity & Battery Sustainability Suite*

**VoltGuardAI** is an innovative hardware monitoring platform built for the **Google Open Innovation Challenge**. It bridges the gap between raw hardware telemetry and actionable user insights using **Google Gemini AI** and **Firebase**.

---

## 🚀 The Problem
Battery degradation is a silent killer of electronic devices. Users often see their "Maximum Capacity" drop without understanding why. Existing tools provide **data** (percentage) but lack **insight** (reasons). This leads to premature device replacement and increased e-waste.

# 🔋 VoltGuardAI 
### *AI-Powered Device Longevity & Battery Sustainability Suite*

**VoltGuardAI** is an advanced hardware monitoring platform developed for the **Google Open Innovation Challenge**. It bridges the gap between raw hardware telemetry and actionable user insights by combining the power of **Google Gemini AI** and **Firebase**.

---

## 🚀 The Problem: The Silent Hardware Crisis
Battery degradation is a silent killer of modern electronics. Users often witness their "Maximum Capacity" drop without ever understanding the specific environmental or software factors causing it. Current system tools provide **raw data** (percentages and numbers) but lack **contextual insight** (reasons and solutions). This results in premature hardware failure, unnecessary financial loss, and a massive increase in global e-waste.

## 💡 The Solution: The "Hardware Doctor"
VoltGuardAI transforms passive monitoring into proactive stewardship:
1. **Intelligent Capture:** A cross-platform background agent extracts deep hardware metrics including Cycle Counts, Thermal Pressure, and specific App-level resource consumption.
2. **Contextual Analysis:** Telemetry is streamed to **Google Firebase** to build a long-term "Health History."
3. **AI Prescription:** **Google Gemini AI** acts as a reasoning engine, comparing current behavior against historical baselines to provide human-readable "Action Plans" and "Health Reports."

---

## 🛠️ Tech Stack

### **Google Cloud Ecosystem**
*   **Google Gemini AI (1.5 Flash/Pro):** Our core "Reasoning Engine" for advanced pattern recognition and natural language hardware diagnosis.
*   **Google Firebase (Firestore):** Used as a high-performance, real-time time-series database for hardware telemetry.
*   **Firebase Cloud Hosting:** Ensuring secure and high-availability deployment for the web suite.

### **Core Engineering**
*   **Frontend:** React.js, Tailwind CSS, Recharts (Dynamic Visualization).
*   **Backend:** Node.js, Express.js (Modular microservice architecture).
*   **Hardware Layer:** Python-based cross-platform agent (psutil, subprocess).

---

## 📁 Project Structure

```text
VoltGuardAI/
├── agent/            # Python Telemetry Agent (Hardware Layer)
│   ├── main.py       # Cross-platform extraction logic
│   └── requirements.txt
├── server/           # Node.js API (AI & Processing Layer)
│   ├── routes/       # Modular API endpoints (Logs, AI)
│   ├── controllers/  # Business Logic & Analyst Service
│   └── index.js      # Server entry point
└── frontend/         # React Dashboard (User Interface)
    ├── src/          # Components, Charts & AI Reports
    └── tailwind.config.js
✨ Key Features

Deep Telemetry Tracking: Monitors Cycle Counts, Thermal Stress, and sustained RAM pressure.
Comparative AI Diagnosis: Compares live data against historical trends to detect "Silent Failures."
Sustainable Action Plans: Generates prioritized, bolded highlights to help users extend device life.
IP-Based Auto-Detection: Seamlessly links the dashboard to the local hardware via network-aware detection.
Eco-Impact Monitoring: Identifies high-drain apps and translates data into sustainability insights.

🏗️ Installation & Setup

1. Hardware Agent Setup 
cd .\Techsprint_IITBh\
cd agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py

2. Server 

cd .\Techsprint_IITBh\
cd server
docker stop $(docker ps -aq)  
docker build -t voltguard-backend .
docker run -p 8080:8080 --env GEMINI_API_KEY=AIzaSyCgjgkyXNlBDZnNXLiILX95PTHSF-le9hM voltguard-backend

3. Frontend 

cd .\Techsprint_IITBh\
cd frontend
docker build -t voltguard-frontend .
docker run -p 3000:5173 voltguard-frontend

🌍 Impact

VoltGuardAI aims to reduce the global carbon footprint of the tech industry by extending the functional lifecycle of personal and enterprise hardware. By providing users with the tools to understand their machines, we prevent premature device disposal and foster a culture of Hardware Stewardship.


    










    
