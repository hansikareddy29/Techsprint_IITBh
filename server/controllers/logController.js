const db = require('../config/firebase-config');
const admin = require('firebase-admin');

exports.saveLog = async (req, res) => {
    try {
        const p = req.body; 
        
        // Mapping Python keys to our Database names
        const logEntry = {
            deviceId: p.device_id,
            os: p.os,
            battery_level: p.battery_percent,
            is_charging: p.is_charging,
            cpu_load: p.cpu_load,
            ram_usage: p.ram_usage,
            top_apps: p.top_apps || [],
            timestamp: new Date().toISOString()
        };

        // Automatic Alert Trigger
        if (logEntry.cpu_load > 90) {
            logEntry.isAlert = true;
            logEntry.alertType = "High System Stress";
        }

        await db.collection('battery_logs').add(logEntry);
        res.status(201).json({ message: "Telemetry Saved", device: logEntry.deviceId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snap = await db.collection('battery_logs').where('deviceId', '==', deviceId).get();
        if (snap.empty) return res.status(404).json({ message: "No data" });

        const logs = snap.docs.map(doc => doc.data());
        let sumCpu = 0;
        logs.forEach(l => sumCpu += l.cpu_load);

        res.json({
            avgCpu: (sumCpu / logs.length).toFixed(1),
            lastBattery: logs[logs.length-1].battery_level,
            totalLogs: logs.length
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getHistory = async (req, res) => {
    const { deviceId } = req.params;
    const snap = await db.collection('battery_logs').where('deviceId', '==', deviceId).get();
    const history = snap.docs.map(doc => doc.data()).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json(history);
};

// --- ADD THIS TO THE BOTTOM OF logController.js ---

// 4. Notification Token Registration
exports.registerToken = async (req, res) => {
    try {
        const { deviceId, fcmToken } = req.body;
        await db.collection('device_tokens').doc(deviceId).set({
            fcmToken: fcmToken,
            timestamp: new Date().toISOString()
        });
        res.json({ message: "Notification token registered!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Get List of Unique Devices
exports.getDevices = async (req, res) => {
    try {
        const snapshot = await db.collection('battery_logs').get();
        const deviceSet = new Set();
        snapshot.forEach(doc => {
            if(doc.data().deviceId) deviceSet.add(doc.data().deviceId);
        });
        res.json({ devices: Array.from(deviceSet) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};