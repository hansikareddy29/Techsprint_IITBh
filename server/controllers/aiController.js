const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .get();

        const logs = snapshot.docs.map(doc => doc.data());
        if (logs.length === 0) return res.status(404).json({ error: "No hardware data found." });

        // Sort latest first
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latest = logs[0];

        const prompt = `Analyze this REAL hardware telemetry: ${JSON.stringify(logs.slice(0,10))}.
        Current Apps: ${latest.top_apps.join(', ')}.
        Return a JSON ONLY (no markdown):
        {
          "overallScore": 0-100,
          "summary": "Specific diagnosis for these apps on ${latest.os}",
          "culprits": ["Specific apps"],
          "prediction": "Health trend",
          "actionPlan": ["Advice 1", "Advice 2"]
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        res.json(JSON.parse(text)); 

    } catch (error) {
        res.status(500).json({ error: "AI analysis failed. Check Gemini API connection." });
    }
};