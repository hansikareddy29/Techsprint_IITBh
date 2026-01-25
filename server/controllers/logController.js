const db = require('../config/firebase-config');

exports.saveLog = async (req, res) => {
    try {
        const p = req.body;
        const cpu = Number(p.cpu_load) || 0;
        const ram = Number(p.ram_usage) || 0;
        const batt = Number(p.battery_percent) || 0;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        let isAlert = false;
        let alertReason = "";
        if (cpu > 90) { isAlert = true; alertReason = "High CPU Stress"; }
        else if (ram > 90) { isAlert = true; alertReason = "Extreme RAM Pressure"; }
        else if (batt < 15 && !p.is_charging) { isAlert = true; alertReason = "Low Battery"; }

        const logEntry = {
            deviceId: (p.deviceId || "Unknown").trim(),
            os: p.os || "Unknown",
            ipAddress: ip,
            battery_level: batt,
            is_charging: p.is_charging || false,
            cpu_load: cpu,
            ram_usage: ram,
            top_apps: p.top_apps || [],
            cycles: p.cycles || 0,
            health: p.health || 100,
            timestamp: new Date().toISOString(),
            isAlert,
            alertReason: alertReason || "System Healthy"
        };

        await db.collection('battery_logs').add(logEntry);
        res.status(201).json({ message: "Saved" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getStats = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim();
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc').get();

        if (snapshot.empty) return res.status(404).json({ message: "No data" });

        const logs = snapshot.docs.map(doc => doc.data());
        const recentAlert = logs.find(l => l.isAlert === true);

        res.json({
            avgCpu: (logs.reduce((s, l) => s + l.cpu_load, 0) / logs.length).toFixed(1),
            lastBattery: logs[0].battery_level,
            batteryHealth: logs[0].health, // <--- ADDED THIS LINE
            totalAlerts: logs.filter(l => l.isAlert).length,
            latestAlertReason: recentAlert ? recentAlert.alertReason : "System Healthy"
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
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
    } catch (error) { res.status(500).json({ error: error.message }); }
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