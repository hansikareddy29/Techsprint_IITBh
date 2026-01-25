const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyst = require('./controllers/analystService');
const db = require('./config/firebase-config');

// --- 1. INITIALIZE APP FIRST ---
const app = express();

// --- 2. CONFIGURE MIDDLEWARE ---
// This MUST come after initializing 'app'
app.use(cors({
  origin: "*", // Allows your Vercel frontend to talk to this server
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- 3. ROUTES ---
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => res.send('VoltGuard AI Backend is Live'));

// --- 4. BACKGROUND ANALYST TASK ---
// This runs every 6 hours to update long-term trends
setInterval(async () => {
    try {
        console.log("🕒 Starting Global Background Analysis...");
        const snapshot = await db.collection('battery_logs').get();
        const deviceSet = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.deviceId) deviceSet.add(data.deviceId.trim());
        });
        
        for (let id of deviceSet) {
            await analyst.generateLongTermTrend(id);
        }
    } catch (e) { 
        console.log("Background Task Error:", e.message); 
    }
}, 21600000); // 6 Hours

// --- 5. START SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VoltGuard Server running on port ${PORT}`);
});