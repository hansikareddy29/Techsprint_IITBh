const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // 1. Fetch logs for this device (WITHOUT orderBy to avoid index errors)
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .limit(10) 
            .get();

        const logs = snapshot.docs.map(doc => doc.data());

        if (logs.length === 0) {
            return res.json({ diagnosis: "Waiting for hardware data..." });
        }

        // 2. SORT IN JAVASCRIPT (Get the newest one first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latest = logs[0];

        try {
            // 3. Call Gemini
            const prompt = `Analyze: CPU ${latest.cpu_load}%, Apps: ${latest.top_apps.join(', ')}. Why is battery health dropping? Give 1 tip. Max 30 words. Format: REASON: ... | ADVICE: ...`;
            const result = await model.generateContent(prompt);
            res.json({ diagnosis: result.response.text() });
        } catch (aiError) {
            console.error("Gemini API Error:", aiError);
            res.json({ 
                diagnosis: `REASON: High usage from ${latest.top_apps[0]}. | ADVICE: Close background tasks to cool battery.`,
                note: "Using fallback"
            });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: error.message });
    }
};