const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const logRoutes = require('./routes/logRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('VoltGuard API is Live!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});