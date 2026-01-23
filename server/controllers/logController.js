const db = require('../config/firebase-config');

/**
 * 1. SAVE LOG
 * Triggered by Python Agent
 */
exports.saveLog = async (req, res) => {
    try {
        const p = req.body;
        const incomingId = p.deviceId || p.device_id;

        if (!incomingId) return res.status(400).json({ error: "No deviceId provided" });

        const logEntry = {
            deviceId: incomingId.trim(),
            os: p.os || "Unknown",
            battery_level: Number(p.battery_percent) || 0,
            is_charging: p.is_charging || false,
            cpu_load: Number(p.cpu_load) || 0,
            ram_usage: Number(p.ram_usage) || 0,
            top_apps: p.top_apps || [],
            cycles: p.cycles || 0,
            health: p.health || 100,
            timestamp: new Date().toISOString()
        };

        await db.collection('battery_logs').add(logEntry);
        console.log(`📈 Log saved for: ${logEntry.deviceId}`);
        res.status(201).json({ message: "Telemetry Saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 2. GET HISTORY
 * Triggered by Frontend for Chart
 */
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

/**
 * 3. GET STATS
 * Triggered by Frontend for Dashboard Cards
 */
exports.getStats = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim();
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc') 
            .get();

        if (snapshot.empty) return res.status(404).json({ message: "No data found" });

        const logs = snapshot.docs.map(doc => doc.data());
        let sumCpu = 0;
        logs.forEach(l => sumCpu += (l.cpu_load || 0));

        res.json({
            avgCpu: (sumCpu / logs.length).toFixed(1),
            lastBattery: logs[0].battery_level, // Most recent entry
            totalAlerts: logs.filter(l => l.cpu_load > 90).length,
            totalLogs: logs.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 4. GET DEVICES
 * Triggered by Frontend for Dropdown
 */
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

/**
 * 5. REGISTER TOKEN
 */
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