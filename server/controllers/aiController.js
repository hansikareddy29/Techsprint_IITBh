const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs').where('deviceId', '==', deviceId).limit(3).get();
        const logs = snapshot.docs.map(doc => doc.data());

        if (logs.length === 0) {
            return res.json({ diagnosis: "REASON: No data found. | ADVICE: Please run the hardware agent script." });
        }

        try {
            // Attempt to call Google AI
            const prompt = `Analyze: ${JSON.stringify(logs)}. Why is battery health dropping? Give 1 short tip. Max 30 words.`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            res.json({ diagnosis: response.text() });
        } catch (aiError) {
            console.error("AI API Error:", aiError);
            // SAFETY NET: If AI fails, return a simulated response so the Frontend doesn't break
            res.json({ 
                diagnosis: "REASON: High thermal stress detected during charging. | ADVICE: Remove the phone case while charging to improve airflow.",
                note: "Showing simulated diagnosis due to AI connection issues."
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};