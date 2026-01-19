const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snap = await db.collection('battery_logs').where('deviceId', '==', deviceId).limit(5).get();
        const logs = snap.docs.map(doc => doc.data());

        if (logs.length === 0) return res.json({ diagnosis: "Waiting for hardware data..." });

        const apps = logs[0].top_apps ? logs[0].top_apps.join(', ') : "System";
        
        try {
            const prompt = `Analyze: CPU ${logs[0].cpu_load}%, Apps: ${apps}. Explain battery stress and give 1 tip. Max 30 words. Format: REASON: ... | ADVICE: ...`;
            const result = await model.generateContent(prompt);
            res.json({ diagnosis: result.response.text() });
        } catch (err) {
            res.json({ diagnosis: `REASON: High usage from ${apps}. | ADVICE: Close background tasks to cool battery.` });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
};