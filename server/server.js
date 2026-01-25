// // const express = require('express');
// // const cors = require('cors');
// // require('dotenv').config();

// // // Import Routes
// // const logRoutes = require('./routes/logRoutes');
// // const aiRoutes = require('./routes/aiRoutes');

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // Use Routes
// // app.use('/api/logs', logRoutes);
// // app.use('/api/ai', aiRoutes);

// // app.get('/', (req, res) => {
// //     res.send('VoltGuard API is Live!');
// // });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });
// // // In Hansika's server.js or controller.js
// // const admin = require('firebase-admin');

// // // When saving the log:
// // const batteryData = {
// //   level: req.body.level,
// //   temp: req.body.temp,
// //   health: req.body.health,
// //   ai_diagnosis: aiResult, // The output from Gemini
// //   timestamp: admin.firestore.FieldValue.serverTimestamp() // <--- SHE MUST USE THIS
// // };

// // await db.collection('battery_logs').add(batteryData);

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const logRoutes = require('./routes/logRoutes');
// const aiRoutes = require('./routes/aiRoutes');

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/logs', logRoutes);
// app.use('/api/ai', aiRoutes);

// app.get('/', (req, res) => res.send('VoltGuard AI Backend is Online'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

const express = require('express');
const cors = require('cors');

// Allow all origins so Vercel and your Python Agent can both talk to the server
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
require('dotenv').config();

const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyst = require('./controllers/analystService'); // New
const db = require('./config/firebase-config');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

// --- BACKGROUND ANALYST TASK ---
// This runs every 6 hours to update the "Memory" for all devices
setInterval(async () => {
    try {
        console.log("🕒 Starting Global Background Analysis...");
        const snapshot = await db.collection('battery_logs').get();
        const deviceSet = new Set();
        snapshot.forEach(doc => deviceSet.add(doc.data().deviceId));
        
        for (let id of deviceSet) {
            await analyst.generateLongTermTrend(id);
        }
    } catch (e) { console.log("Background Task Error:", e.message); }
}, 21600000); // 6 Hours
// -------------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VoltGuard Server running on port ${PORT}`);
});