// const db = require('../config/firebase-config');
// const admin = require('firebase-admin');

// /**
//  * HELPER FUNCTION: Sends Push Notifications via FCM
//  * This is called automatically when high stress is detected.
//  */
// const sendPushNotification = async (deviceId, alertType) => {
//     try {
//         const tokenDoc = await db.collection('device_tokens').doc(deviceId).get();
//         if (!tokenDoc.exists) {
//             console.log(`🔔 Info: No FCM token registered for ${deviceId}. Skipping notification.`);
//             return;
//         }

//         const registrationToken = tokenDoc.data().fcmToken;
//         const message = {
//             notification: {
//                 title: '🔋 VoltGuard Alert!',
//                 body: `Critical Warning: ${alertType} detected on your device.`
//             },
//             token: registrationToken
//         };

//         const response = await admin.messaging().send(message);
//         console.log('✅ Push Notification Sent:', response);
//     } catch (error) {
//         console.log('❌ Notification Error (likely invalid token):', error.message);
//     }
// };

// /**
//  * 1. SAVE LOG
//  * Receives data from Member 1's Python script.
//  * Maps Python keys (device_id) to Database keys (deviceId).
//  */
// exports.saveLog = async (req, res) => {
//     try {
//         const p = req.body; // Incoming payload from Python

//         // Safety check to prevent 500 crashes
//         if (!p || !p.deviceId) {
//             return res.status(400).json({ error: "Missing device_id in request body" });
//         }

//         const logEntry = {
//             deviceId: p.deviceId,
//             os: p.os || "Unknown",
//             battery_level: p.battery_percent || 0,
//             is_charging: p.is_charging || false,
//             cpu_load: p.cpu_load || 0,
//             ram_usage: p.ram_usage || 0,
//             top_apps: p.top_apps || [],
//             timestamp: new Date().toISOString(),
//             isAlert: false
//         };

//         // Automatic Alert Logic: CPU > 90%
//         if (logEntry.cpu_load > 90) {
//             logEntry.isAlert = true;
//             logEntry.alertType = "High System Stress";
//             sendPushNotification(logEntry.deviceId, "Extreme CPU Load");
//         }

//         await db.collection('battery_logs').add(logEntry);
//         console.log(`📈 Log saved successfully for: ${logEntry.deviceId}`);
        
//         res.status(201).json({ message: "Telemetry Saved", device: logEntry.deviceId });
//     } catch (error) {
//         console.error("CRASH IN SAVELOG:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// /**
//  * 2. GET HISTORY
//  * Returns all logs for a specific device, sorted by time.
//  * Used by Member 3 for the Charts.
//  */
// exports.getHistory = async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         const snapshot = await db.collection('battery_logs')
//             .where('deviceId', '==', deviceId)
//             .get();

//         if (snapshot.empty) return res.json([]);

//         const history = snapshot.docs.map(doc => doc.data());
        
//         // Sort in JavaScript to avoid Firestore Index requirement
//         history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// /**
//  * 3. GET STATS
//  * Calculates averages and peaks for Dashboard cards.
//  */
// exports.getStats = async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         const snapshot = await db.collection('battery_logs')
//             .where('deviceId', '==', deviceId)
//             .get();

//         if (snapshot.empty) return res.status(404).json({ message: "No data found" });

//         const logs = snapshot.docs.map(doc => doc.data());
//         let sumCpu = 0, maxCpu = 0, alerts = 0;

//         logs.forEach(l => {
//             sumCpu += (l.cpu_load || 0);
//             if (l.cpu_load > maxCpu) maxCpu = l.cpu_load;
//             if (l.isAlert) alerts++;
//         });

//         res.json({
//             avgCpu: (sumCpu / logs.length).toFixed(1),
//             peakCpu: maxCpu,
//             totalAlerts: alerts,
//             lastBattery: logs[logs.length - 1].battery_level,
//             totalLogs: logs.length
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// /**
//  * 4. GET UNIQUE DEVICES
//  * Returns a list of all devices that have sent data.
//  * Used by Member 3 for the selection dropdown.
//  */
// exports.getDevices = async (req, res) => {
//     try {
//         const snapshot = await db.collection('battery_logs').get();
//         const deviceSet = new Set();
//         snapshot.forEach(doc => {
//             const data = doc.data();
//             const id = data.deviceId || data.deviceId;
//             if (id) deviceSet.add(id);
//         });
//         res.json({ devices: Array.from(deviceSet) });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// /**
//  * 5. REGISTER FCM TOKEN
//  * Saves the browser's notification token to Firestore.
//  */
// exports.registerToken = async (req, res) => {
//     try {
//         const { deviceId, fcmToken } = req.body;
//         if (!deviceId || !fcmToken) return res.status(400).json({ error: "Missing fields" });

//         await db.collection('device_tokens').doc(deviceId).set({
//             fcmToken: fcmToken,
//             timestamp: new Date().toISOString()
//         });

//         res.json({ message: "FCM Token Registered Successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
const db = require('../config/firebase-config');
const admin = require('firebase-admin');

/**
 * HELPER: Send Push Notifications
 */
const sendPushNotification = async (deviceId, alertType) => {
    try {
        const tokenDoc = await db.collection('device_tokens').doc(deviceId).get();
        if (!tokenDoc.exists) return;

        const registrationToken = tokenDoc.data().fcmToken;
        const message = {
            notification: {
                title: '🔋 VoltGuard Alert!',
                body: `Critical: ${alertType} on ${deviceId}`
            },
            token: registrationToken
        };
        await admin.messaging().send(message);
    } catch (error) {
        console.log('🔔 Notification skipped:', error.message);
    }
};

/**
 * 1. SAVE LOG
 * Receives data from Python. 
 * Fixes the "device_id" vs "deviceId" mismatch automatically.
 */
exports.saveLog = async (req, res) => {
    try {
        const p = req.body;

        // CRITICAL: Handle both naming conventions just in case
        const incomingId = p.deviceId || p.device_id;

        if (!incomingId) {
            return res.status(400).json({ error: "No device identifier found in payload" });
        }

        const logEntry = {
            deviceId: incomingId.trim(), // Clean whitespace
            os: p.os || "Unknown",
            battery_level: Number(p.battery_percent) || 0,
            is_charging: p.is_charging || false,
            cpu_load: Number(p.cpu_load) || 0,
            ram_usage: Number(p.ram_usage) || 0,
            top_apps: p.top_apps || [],
            cycles: p.cycles || 0,
            health: p.health || 100,
            timestamp: new Date().toISOString(),
            isAlert: false
        };

        // Alert Logic
        if (logEntry.cpu_load > 90) {
            logEntry.isAlert = true;
            logEntry.alertType = "High System Stress";
            sendPushNotification(logEntry.deviceId, "Extreme CPU Load");
        }

        await db.collection('battery_logs').add(logEntry);
        console.log(`📈 Log saved: ${logEntry.deviceId} | CPU: ${logEntry.cpu_load}%`);
        
        res.status(201).json({ message: "Telemetry Saved" });
    } catch (error) {
        console.error("SAVE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * 2. GET HISTORY
 * Returns logs for the chart.
 */
exports.getHistory = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim(); // Trim for safety
        
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc') // Get newest first
            .limit(50)
            .get();

        if (snapshot.empty) return res.json([]);

        const history = snapshot.docs.map(doc => doc.data());
        // Reverse so the chart shows left-to-right (oldest to newest)
        res.json(history.reverse());
    } catch (error) {
        // If you get an error here, it might be a "Missing Index" error.
        // Check your terminal for a link to click and create the index.
        console.error("HISTORY ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * 3. GET STATS
 * Calculates averages for the dashboard cards.
 */
exports.getStats = async (req, res) => {
    try {
        const deviceId = req.params.deviceId.trim();
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .get();

        if (snapshot.empty) return res.status(404).json({ message: "No data found" });

        const logs = snapshot.docs.map(doc => doc.data());
        let sumCpu = 0, maxCpu = 0, alerts = 0;

        logs.forEach(l => {
            sumCpu += (Number(l.cpu_load) || 0);
            if (l.cpu_load > maxCpu) maxCpu = l.cpu_load;
            if (l.isAlert) alerts++;
        });

        res.json({
            avgCpu: (sumCpu / logs.length).toFixed(1),
            peakCpu: maxCpu,
            totalAlerts: alerts,
            lastBattery: logs[logs.length - 1].battery_level,
            totalLogs: logs.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 4. GET UNIQUE DEVICES
 * Lists names for the dropdown.
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