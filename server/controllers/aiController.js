const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

// In-memory cache to save your API quota
const diagnosisCache = {}; 

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const now = Date.now();

        // 1. Check Cache (15-minute window)
        if (diagnosisCache[deviceId] && (now - diagnosisCache[deviceId].time < 900000)) {
            console.log(`📦 Serving Cached AI Report for ${deviceId}`);
            return res.json(diagnosisCache[deviceId].data);
        }

        // 2. Fetch last 10 logs
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId.trim())
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) return res.status(404).json({ error: "No data" });
        const logs = snapshot.docs.map(doc => doc.data());
        const latest = logs[0];

        // 3. Request AI Diagnosis
        console.log(`🤖 Requesting NEW AI Diagnosis for ${deviceId}...`);
        
        const prompt = `
            Analyze hardware telemetry for ${deviceId}. 
            Data: ${JSON.stringify(logs)}
            
            Return ONLY a valid JSON object. No other text.
            {
              "overallScore": 85,
              "summary": "Short technical overview",
              "culprits": ["Chrome", "VS Code"],
              "prediction": "Battery trend info",
              "actionPlan": ["Step 1", "Step 2", "Step 3"]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // DEBUG: See what the AI actually said in your terminal
        console.log("--- RAW AI RESPONSE START ---");
        console.log(text);
        console.log("--- RAW AI RESPONSE END ---");

        // 4. Extract and Clean JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI did not return valid JSON structure");

        const aiData = JSON.parse(jsonMatch[0]);

        // 5. Store in Cache and Send
        diagnosisCache[deviceId] = { time: now, data: aiData };
        console.log(`✅ AI Analysis saved for ${deviceId}`);
        res.json(aiData);

    } catch (error) {
        console.error("❌ AI ERROR:", error.message);
        
        // Return a fallback so the UI doesn't look empty if Gemini fails
        res.status(500).json({ 
            overallScore: "!!",
            summary: "AI analysis temporary unavailable. Check terminal logs for: " + error.message,
            culprits: ["N/A"],
            actionPlan: ["Check API Quota", "Verify Model Name"]
        });
    }
};