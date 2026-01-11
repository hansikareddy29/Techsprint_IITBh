const db = require('../config/firebase-config');

exports.saveLog = async (req, res) => {
    try {
        const logData = req.body;
        logData.timestamp = new Date().toISOString();

        // HEAT ALERT LOGIC
        if (logData.temperature > 45) {
            logData.isAlert = true;
            logData.alertType = "Overheating";
            
            // 🔥 TRIGGER THE PUSH NOTIFICATION
            sendPushNotification(logData.deviceId, "Critical Overheating");
        }

        await db.collection('battery_logs').add(logData);
        res.status(201).json({ message: "Log saved!", alertSent: logData.isAlert || false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        // Fetch all logs for this device, sorted by time
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .get();

        const history = snapshot.docs.map(doc => doc.data());
        
        // Sort manually by timestamp (ISO strings sort well)
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// This saves the "Address" of the user's browser
exports.registerToken = async (req, res) => {
    try {
        const { deviceId, fcmToken } = req.body;
        
        // Save or Update the token for this device
        await db.collection('device_tokens').doc(deviceId).set({
            fcmToken: fcmToken,
            lastUpdated: new Date().toISOString()
        });

        res.status(200).json({ message: "Notification token registered!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const admin = require('firebase-admin');

const sendPushNotification = async (deviceId, alertType) => {
    try {
        // 1. Get the token for this device
        const tokenDoc = await db.collection('device_tokens').doc(deviceId).get();
        
        if (!tokenDoc.exists) {
            console.log("No notification token found for this device.");
            return;
        }

        const registrationToken = tokenDoc.data().fcmToken;

        // 2. Construct the message
        const message = {
            notification: {
                title: '🔋 VoltGuard Alert!',
                body: `Critical Warning: ${alertType} detected on your device.`
            },
            token: registrationToken
        };

        // 3. Send the message via Firebase
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
exports.getStats = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No data found for this device" });
        }

        const logs = snapshot.docs.map(doc => doc.data());

        // 📊 PERFORM CALCULATIONS
        const totalLogs = logs.length;
        let sumTemp = 0;
        let maxTemp = 0;
        let alertCount = 0;
        let latestHealth = 100;

        logs.forEach(log => {
            sumTemp += log.temperature || 0;
            if (log.temperature > maxTemp) maxTemp = log.temperature;
            if (log.isAlert) alertCount++;
            
            // Assuming we want the health from the most recent log
            latestHealth = log.health || latestHealth; 
        });

        const avgTemp = (sumTemp / totalLogs).toFixed(2);

        // SEND THE SUMMARY
        res.json({
            deviceId,
            totalReadings: totalLogs,
            averageTemperature: parseFloat(avgTemp),
            peakTemperature: maxTemp,
            heatAlerts: alertCount,
            currentHealth: latestHealth
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDeviceList = async (req, res) => {
    try {
        const snapshot = await db.collection('battery_logs').get();
        const devices = new Set(); // Use a Set to avoid duplicates

        snapshot.forEach(doc => {
            devices.add(doc.data().deviceId);
        });

        res.json({ devices: Array.from(devices) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};