// const db = require('../config/firebase-config');

// exports.saveLog = async (req, res) => {
//     try {
//         const logData = req.body;
//         logData.timestamp = new Date().toISOString();

//         // HEAT ALERT LOGIC
//         if (logData.temperature > 45) {
//             logData.isAlert = true;
//             logData.alertType = "Overheating";
            
//             // 🔥 TRIGGER THE PUSH NOTIFICATION
//             sendPushNotification(logData.deviceId, "Critical Overheating");
//         }

//         await db.collection('battery_logs').add(logData);
//         res.status(201).json({ message: "Log saved!", alertSent: logData.isAlert || false });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// exports.getHistory = async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         // Fetch all logs for this device, sorted by time
//         const snapshot = await db.collection('battery_logs')
//             .where('deviceId', '==', deviceId)
//             .get();

//         const history = snapshot.docs.map(doc => doc.data());
        
//         // Sort manually by timestamp (ISO strings sort well)
//         history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// // This saves the "Address" of the user's browser
// exports.registerToken = async (req, res) => {
//     try {
//         const { deviceId, fcmToken } = req.body;
        
//         // Save or Update the token for this device
//         await db.collection('device_tokens').doc(deviceId).set({
//             fcmToken: fcmToken,
//             lastUpdated: new Date().toISOString()
//         });

//         res.status(200).json({ message: "Notification token registered!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// const admin = require('firebase-admin');

// const sendPushNotification = async (deviceId, alertType) => {
//     try {
//         // 1. Get the token for this device
//         const tokenDoc = await db.collection('device_tokens').doc(deviceId).get();
        
//         if (!tokenDoc.exists) {
//             console.log("No notification token found for this device.");
//             return;
//         }

//         const registrationToken = tokenDoc.data().fcmToken;

//         // 2. Construct the message
//         const message = {
//             notification: {
//                 title: '🔋 VoltGuard Alert!',
//                 body: `Critical Warning: ${alertType} detected on your device.`
//             },
//             token: registrationToken
//         };

//         // 3. Send the message via Firebase
//         const response = await admin.messaging().send(message);
//         console.log('Successfully sent message:', response);
//     } catch (error) {
//         console.error('Error sending message:', error);
//     }
// };
// exports.getStats = async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         const snapshot = await db.collection('battery_logs')
//             .where('deviceId', '==', deviceId)
//             .get();

//         if (snapshot.empty) {
//             return res.status(404).json({ message: "No data found for this device" });
//         }

//         const logs = snapshot.docs.map(doc => doc.data());

//         const totalLogs = logs.length;
//         let sumTemp = 0;
//         let maxTemp = 0;
//         let alertCount = 0;
//         let latestHealth = 100;

//         logs.forEach(log => {
//             sumTemp += log.temperature || 0;
//             if (log.temperature > maxTemp) maxTemp = log.temperature;
//             if (log.isAlert) alertCount++;
            
//             // Assuming we want the health from the most recent log
//             latestHealth = log.health || latestHealth; 
//         });

//         const avgTemp = (sumTemp / totalLogs).toFixed(2);

//         // SEND THE SUMMARY
//         res.json({
//             deviceId,
//             totalReadings: totalLogs,
//             averageTemperature: parseFloat(avgTemp),
//             peakTemperature: maxTemp,
//             heatAlerts: alertCount,
//             currentHealth: latestHealth
//         });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// exports.getDeviceList = async (req, res) => {
//     try {
//         const snapshot = await db.collection('battery_logs').get();
//         const devices = new Set(); // Use a Set to avoid duplicates

//         snapshot.forEach(doc => {
//             devices.add(doc.data().deviceId);
//         });

//         res.json({ devices: Array.from(devices) });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const db = require('../config/firebase-config');
const admin = require('firebase-admin');

// 1. Save Log (Mapped to Member 1's Python script)
exports.saveLog = async (req, res) => {
    try {
        const p = req.body; // Payload from Python
        
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

        // Automatic Alert Logic: High CPU = High Heat
        if (logEntry.cpu_load > 90) {
            logEntry.isAlert = true;
            logEntry.alertType = "High System Stress";
            // Call the push notification function if registered
            sendPushNotification(logEntry.deviceId, "Critical CPU Load Detected");
        }

        await db.collection('battery_logs').add(logEntry);
        res.status(201).json({ message: "Hardware telemetry saved!", device: logEntry.deviceId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Get Stats for Dashboard Cards
exports.getStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs').where('deviceId', '==', deviceId).get();

        if (snapshot.empty) return res.status(404).json({ message: "No data" });

        const logs = snapshot.docs.map(doc => doc.data());
        let sumCpu = 0, maxCpu = 0, alerts = 0;
        
        logs.forEach(l => {
            sumCpu += l.cpu_load;
            if (l.cpu_load > maxCpu) maxCpu = l.cpu_load;
            if (l.isAlert) alerts++;
        });

        res.json({
            avgCpu: (sumCpu / logs.length).toFixed(2),
            peakCpu: maxCpu,
            totalAlerts: alerts,
            lastKnownBattery: logs[logs.length-1].battery_level
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Get History for Charts
exports.getHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs').where('deviceId', '==', deviceId).get();
        const history = snapshot.docs.map(doc => doc.data());
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Notification Logic (FCM)
const sendPushNotification = async (deviceId, type) => {
    try {
        const doc = await db.collection('device_tokens').doc(deviceId).get();
        if (!doc.exists) return;
        const message = {
            notification: { title: '🔋 VoltGuard Alert', body: type },
            token: doc.data().fcmToken
        };
        await admin.messaging().send(message);
    } catch (e) { console.log("Notification failed (likely invalid token)"); }
};

exports.registerToken = async (req, res) => {
    const { deviceId, fcmToken } = req.body;
    await db.collection('device_tokens').doc(deviceId).set({ fcmToken });
    res.json({ message: "Token Registered" });
};

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