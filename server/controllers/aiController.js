const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

// In-memory cache to save your API quota (15-minute window)
const diagnosisCache = {}; 

exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const now = Date.now();

        // 1. Check Cache: If we already analyzed this device in the last 15 mins, return that
        if (diagnosisCache[deviceId] && (now - diagnosisCache[deviceId].time < 900000)) {
            console.log(`📦 Serving Cached AI Report for ${deviceId}`);
            return res.json(diagnosisCache[deviceId].data);
        }

        // 2. Fetch the last 10 logs for this specific device
        // We need historical data so the AI can see trends (like battery dropping)
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId.trim())
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "No telemetry data found for this device." });
        }

        const logs = snapshot.docs.map(doc => doc.data());
        
        // 3. Prepare the Prompt for Gemini
        console.log(`🤖 Requesting NEW AI Diagnosis for ${deviceId}...`);
        
        const prompt = `
            You are a hardware diagnostic expert. Analyze the following telemetry logs for the computer "${deviceId}".
            
            DATA:
            ${JSON.stringify(logs)}
            
            INSTRUCTIONS:
            1. Evaluate the battery health (cycles vs health percentage).
            2. Identify if CPU or RAM usage is sustained at a high level (>80%).
            3. Look for "top_apps" that are consuming the most resources.
            4. Provide a technical summary and a 3-step action plan.

            Return ONLY a valid JSON object. Do not include markdown or backticks.
            Structure:
            {
              "overallScore": (number between 0-100),
              "summary": "A 2-sentence technical summary of the system state.",
              "culprits": ["App Name 1", "App Name 2"],
              "actionPlan": [
                { "step": "Step 1 Title", "description": "Specific instruction for user" },
                { "step": "Step 2 Title", "description": "Specific instruction for user" },
                { "step": "Step 3 Title", "description": "Specific instruction for user" }
              ]
            }
        `;

        // 4. Generate AI Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 5. Clean the response (Gemini sometimes adds ```json ... ```)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI output was not in a valid JSON format.");
        }

        const aiData = JSON.parse(jsonMatch[0]);

        // 6. Store in Cache and Send to Frontend
        diagnosisCache[deviceId] = { time: now, data: aiData };
        console.log(`✅ AI Analysis completed for ${deviceId}`);
        
        res.json(aiData);

    } catch (error) {
        console.error("❌ AI ERROR:", error.message);
        
        // Fallback Response: If the AI fails or the limit is reached, return this 
        // so the UI doesn't crash or show a red error.
        res.status(500).json({ 
            overallScore: "!!",
            summary: "AI Diagnosis is temporarily unavailable due to API limits or a connection error.",
            culprits: ["N/A"],
            actionPlan: [
                { "step": "Check Connection", "description": "Ensure the backend server is connected to the internet." },
                { "step": "Wait for Quota", "description": "Free AI API keys have strict rate limits. Please try again in 1 hour." }
            ]
        });
    }
};