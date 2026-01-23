const db = require('../config/firebase-config');


exports.saveLog = async (req, res) => {
    try {
        const p = req.body;
        const incomingId = p.deviceId || p.device_id;

        if (!incomingId) return res.status(400).json({ error: "No deviceId provided" });

        // --- NEW ALERT DETECTION LOGIC ---
        const cpu = Number(p.cpu_load) || 0;
        const ram = Number(p.ram_usage) || 0;
        const batt = Number(p.battery_percent) || 0;
        
        let isAlert = false;
        let alertReason = "";

        if (cpu > 90) {
            isAlert = true;
            alertReason = "High CPU Stress Detected";
        } else if (ram > 90) {
            isAlert = true;
            alertReason = "Memory Pressure High";
        } else if (batt < 15 && !p.is_charging) {
            isAlert = true;
            alertReason = "Low Battery Warning";
        }
        // ---------------------------------

        const logEntry = {
            deviceId: incomingId.trim(),
            os: p.os || "Unknown",
            battery_level: batt,
            is_charging: p.is_charging || false,
            cpu_load: cpu,
            ram_usage: ram,
            top_apps: p.top_apps || [],
            cycles: p.cycles || 0,
            health: p.health || 100,
            timestamp: new Date().toISOString(),
            isAlert: isAlert,        // Added field
            alertReason: alertReason  // Added field
        };

        await db.collection('battery_logs').add(logEntry);
        console.log(`📈 Log saved for: ${logEntry.deviceId} | Alert: ${alertReason || 'None'}`);
        res.status(201).json({ message: "Telemetry Saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getHistory = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim();
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        if (snapshot.empty) return res.json([]);
        const history = snapshot.docs.map(doc => doc.data());
        res.json(history.reverse());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getStats = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim();
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc') 
            .get();

        if (snapshot.empty) return res.status(404).json({ message: "No data found" });

        const logs = snapshot.docs.map(doc => doc.data());
        
        // --- Keep your original logic ---
        let sumCpu = 0;
        logs.forEach(l => sumCpu += (l.cpu_load || 0));

        // --- NEW: Find the latest alert reason ---
        // Since logs are ordered by 'desc', finding the first log with an alert 
        // gives us the most recent reason.
        const recentAlert = logs.find(l => l.isAlert === true);

        res.json({
            avgCpu: (sumCpu / logs.length).toFixed(1),
            lastBattery: logs[0].battery_level, 
            totalAlerts: logs.filter(l => l.isAlert === true).length, // Uses the isAlert flag
            totalLogs: logs.length,
            // Added reason field
            latestAlertReason: recentAlert ? recentAlert.alertReason : "System Healthy" 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getDevices = async (req, res) => {
    try {
        const snapshot = await db.collection('battery_logs').get();
        const deviceSet = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.deviceId) deviceSet.add(data.deviceId.trim());
        });
        res.json({ devices: Array.from(deviceSet) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.registerToken = async (req, res) => {
    try {
        const { deviceId, fcmToken } = req.body;
        await db.collection('device_tokens').doc(deviceId.trim()).set({
            fcmToken,
            timestamp: new Date().toISOString()
        });
        res.json({ message: "Registered" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};