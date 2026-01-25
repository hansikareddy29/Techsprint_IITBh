// controllers/logController.js
const db = require('../config/firebase-config');

// SAVE LOG
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
      userToken: (p.userToken || "").trim(),        // NEW
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
      alertReason: alertReason || "System Healthy",
    };

    await db.collection('battery_logs').add(logEntry);
    res.status(201).json({ message: "Saved" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// STATS
exports.getStats = async (req, res) => {
  try {
    const deviceId = req.params.deviceId.trim();
    const snapshot = await db.collection('battery_logs')
      .where('deviceId', '==', deviceId)
      .orderBy('timestamp', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No data" });
    }

    const logs = snapshot.docs.map(doc => doc.data());
    const recentAlert = logs.find(l => l.isAlert === true);

    const avgCpu =
      logs.reduce((s, l) => s + (Number(l.cpu_load) || 0), 0) /
      logs.length;

    res.json({
      avgCpu: Number(avgCpu.toFixed(1)),
      lastBattery: logs[0].battery_level,
      batteryHealth: logs[0].health,
      totalAlerts: logs.filter(l => l.isAlert).length,
      latestAlertReason: recentAlert ? recentAlert.alertReason : "System Healthy",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// HISTORY (last 20)
exports.getHistory = async (req, res) => {
  try {
    const deviceId = req.params.deviceId.trim();
    const snapshot = await db.collection('battery_logs')
      .where('deviceId', '==', deviceId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const history = snapshot.docs.map(doc => doc.data());
    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LIST UNIQUE DEVICES (optionally per user)
exports.getDevices = async (req, res) => {
  try {
    const userToken = (req.headers['x-voltguard-user-token'] || "").trim();

    let snapshot;
    if (userToken) {
      snapshot = await db.collection('battery_logs')
        .where('userToken', '==', userToken)
        .get();
    } else {
      snapshot = await db.collection('battery_logs').get();
    }

    const deviceSet = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.deviceId) {
        deviceSet.add(data.deviceId.trim());
      }
    });
    res.json({ devices: Array.from(deviceSet) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// OPTIONAL FCM TOKEN
exports.registerToken = async (req, res) => {
  try {
    const { deviceId, fcmToken } = req.body;
    await db.collection('device_tokens')
      .doc(deviceId.trim())
      .set({
        fcmToken,
        timestamp: new Date().toISOString()
      });
    res.json({ message: "Registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: getMyDevice by userToken, not IP
exports.getMyDevice = async (req, res) => {
  try {
    const userToken = (req.headers['x-voltguard-user-token'] || "").trim();
    if (!userToken) {
      return res.json({ deviceId: null });
    }

    console.log("Detecting device for userToken", userToken.slice(0, 6) + "...");

    let snapshot = await db.collection('battery_logs')
      .where('userToken', '==', userToken)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.json({ deviceId: null });
    }

    const deviceId = snapshot.docs[0].data().deviceId;
    res.json({ deviceId });
  } catch (error) {
    console.error("Detection Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
