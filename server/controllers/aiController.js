// const db = require('../config/firebase-config');
// const model = require('../config/gemini-config');

// exports.getDiagnosis = async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         const snapshot = await db.collection('battery_logs').where('deviceId', '==', deviceId).limit(3).get();
//         const logs = snapshot.docs.map(doc => doc.data());

//         if (logs.length === 0) {
//             return res.json({ diagnosis: "REASON: No data found. | ADVICE: Please run the hardware agent script." });
//         }

//         try {
//             // Attempt to call Google AI
//             const prompt = `Analyze: ${JSON.stringify(logs)}. Why is battery health dropping? Give 1 short tip. Max 30 words.`;
//             const result = await model.generateContent(prompt);
//             const response = await result.response;
//             res.json({ diagnosis: response.text() });
//         } catch (aiError) {
//             console.error("AI API Error:", aiError);
//             // SAFETY NET: If AI fails, return a simulated response so the Frontend doesn't break
//             res.json({ 
//                 diagnosis: "REASON: High thermal stress detected during charging. | ADVICE: Remove the phone case while charging to improve airflow.",
//                 note: "Showing simulated diagnosis due to AI connection issues."
//             });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .limit(5).get();

        const logs = snapshot.docs.map(doc => doc.data());
        if (logs.length === 0) return res.json({ diagnosis: "Run the agent script first." });

        const latest = logs[0];
        const apps = latest.top_apps ? latest.top_apps.join(', ') : "System processes";

        try {
            const prompt = `
                User device is running: ${apps}. 
                CPU Load: ${latest.cpu_load}%, Battery: ${latest.battery_level}%. 
                As a Hardware Expert, why is this stress bad for battery and what is your 1 tip regarding these apps?
                Format: REASON: ... | ADVICE: ... (Max 40 words)
            `;
            const result = await model.generateContent(prompt);
            res.json({ diagnosis: result.response.text() });
        } catch (aiErr) {
            res.json({ 
                diagnosis: `REASON: High CPU load from background apps is causing heat stress. | ADVICE: Close ${latest.top_apps[0] || 'heavy apps'} to cool down the battery.`,
                note: "Using fallback diagnosis"
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};