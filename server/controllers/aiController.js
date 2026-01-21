// // const db = require('../config/firebase-config');
// // const model = require('../config/gemini-config');

// // exports.getDiagnosis = async (req, res) => {
// //     try {
// //         const { deviceId } = req.params;
// //         const snapshot = await db.collection('battery_logs')
// //             .where('deviceId', '==', deviceId)
// //             .get();

// //         const logs = snapshot.docs.map(doc => doc.data());
// //         if (logs.length === 0) return res.status(404).json({ error: "No hardware data found." });

// //         // Sort latest first
// //         logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
// //         const latest = logs[0];

// //         const prompt = `
// //   You are an expert Systems Engineer. Analyze this REAL hardware telemetry: ${JSON.stringify(logs.slice(0,10))}.
// //   The user is on a ${latest.os} machine. 
// //   The top processes currently running are: ${latest.top_apps.join(', ')}.

// //   INSTRUCTIONS:
// //   1. Identify which of the specific apps listed are likely causing the current CPU load (${latest.cpu_load}%) and battery drain.
// //   2. Provide a deep technical summary of the device health.
// //   3. Prediction: Based on cycles (${latest.cycles}) and health (${latest.health}%), how much longer until this battery needs replacement?
// //   4. Action Plan: Provide 3-4 specific, non-generic steps to improve this specific device's performance.

// //   Return a JSON ONLY (no markdown):
// //   {
// //     "overallScore": 0-100,
// //     "summary": "Detailed technical analysis...",
// //     "culprits": ["App 1", "App 2"],
// //     "prediction": "Timeframe/Trend...",
// //     "actionPlan": ["Step 1", "Step 2", "Step 3"]
// //   }
// // `;
// //         const result = await model.generateContent(prompt);
// //         const text = result.response.text().replace(/```json|```/g, "").trim();
// //         res.json(JSON.parse(text)); 

// //     } catch (error) {
// //         res.status(500).json({ error: "AI analysis failed. Check Gemini API connection." });
// //     }
// // };
// const db = require('../config/firebase-config');
// const model = require('../config/gemini-config');

// /**
//  * GET DIAGNOSIS
//  * Fetches the last 10 logs for a device and asks Gemini to analyze them.
//  */
// exports.getDiagnosis = async (req, res) => {
//     try {
//         const { deviceId } = req.params;

//         // 1. Fetch real hardware logs from Firebase
//         const snapshot = await db.collection('battery_logs')
//             .where('deviceId', '==', deviceId)
//             .limit(15) // Get enough data for a trend
//             .get();

//         if (snapshot.empty) {
//             return res.status(404).json({ 
//                 error: "No hardware data found.",
//                 summary: "Connect your agent to start analysis." 
//             });
//         }

//         const logs = snapshot.docs.map(doc => doc.data());

//         // Sort latest logs first
//         logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//         const latest = logs[0];

//         // 2. Build a highly detailed prompt
//         // We pass the raw data so Gemini can see the CPU spikes and App names
//         const prompt = `
//             Analyze this REAL hardware telemetry data from a ${latest.os} device:
//             Data Points: ${JSON.stringify(logs.slice(0, 10))}
            
//             Current Top Apps (High CPU usage): ${latest.top_apps.join(', ')}
//             Current CPU Load: ${latest.cpu_load}%
//             Battery Health: ${latest.health}%
//             Cycles: ${latest.cycles}

//             TASK:
//             1. Provide an 'overallScore' (0-100) where 100 is perfect.
//             2. In 'summary', explain exactly why the score is what it is based on the apps and CPU load.
//             3. In 'culprits', list the specific apps from the data that are draining the most power.
//             4. In 'prediction', estimate battery longevity based on health and cycles.
//             5. In 'actionPlan', give 3-4 specific technical steps for the user.

//             Return ONLY a valid JSON object. No markdown, no extra text.
//             {
//               "overallScore": number,
//               "summary": "string",
//               "culprits": ["app1", "app2"],
//               "prediction": "string",
//               "actionPlan": ["step1", "step2"]
//             }
//         `;

//         // 3. Call Gemini AI
//         const result = await model.generateContent(prompt);
//         let text = result.response.text();

//         // 4. CLEANING LOGIC: Remove Markdown formatting if Gemini adds it
//         // This prevents JSON.parse from failing
//         text = text.replace(/```json/g, "").replace(/```/g, "").trim();

//         try {
//             const jsonResponse = JSON.parse(text);
            
//             // Send the successful AI analysis back to your React Frontend
//             res.json(jsonResponse);

//         } catch (parseError) {
//             console.error("AI returned invalid JSON formatting:", text);
//             res.status(500).json({ 
//                 error: "AI Response Error", 
//                 details: "The AI sent back non-JSON text. Please try again." 
//             });
//         }

//     } catch (error) {
//         console.error("CRITICAL AI CONTROLLER ERROR:", error);
//         res.status(500).json({ 
//             error: "AI analysis failed. Check Gemini API key and Firebase connection." 
//         });
//     }
// };
const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

/**
 * GET DIAGNOSIS
 * Triggered by the Frontend to analyze a specific device's telemetry.
 */
exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        // 1. Fetch the last 10 REAL logs for this device
        // This query now works because your "Enabled" index handles deviceId + timestamp
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId.trim())
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        // 2. Handle cases where there is no data yet
        if (snapshot.empty) {
            console.log(`⚠️ No data found in Firebase for device: ${deviceId}`);
            return res.status(404).json({ 
                error: "No data found",
                summary: "Please ensure your Python agent is running and sending telemetry." 
            });
        }

        const logs = snapshot.docs.map(doc => doc.data());
        const latest = logs[0];

        // 3. Construct a high-quality prompt for Gemini
        const prompt = `
            You are VoltGuard AI, a hardware diagnostic expert. 
            Analyze this REAL telemetry from a ${latest.os} device named ${deviceId}:
            
            TELEMETRY DATA (Last 10 logs):
            ${JSON.stringify(logs)}

            CURRENT STATUS:
            - CPU Load: ${latest.cpu_load}%
            - Battery: ${latest.battery_level}%
            - Health: ${latest.health}%
            - Top Processes: ${latest.top_apps.join(', ')}

            REQUIREMENTS:
            1. Return a JSON object ONLY.
            2. Identify which specific apps from the "Top Processes" are likely causing drain.
            3. Provide a 'summary' explaining the device health.
            4. Provide an 'overallScore' from 0-100.
            5. Provide a 3-step 'actionPlan'.

            OUTPUT FORMAT (JSON ONLY):
            {
              "overallScore": 85,
              "summary": "Your device is performing well, but Chrome is using high CPU.",
              "culprits": ["Chrome", "VS Code"],
              "prediction": "Battery replacement suggested in 12 months.",
              "actionPlan": ["Close background tabs", "Lower brightness", "Check charger"]
            }
        `;

        // 4. Call Gemini AI
        console.log(`🤖 Requesting AI Diagnosis for ${deviceId}...`);
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // 5. SANITIZE: Remove markdown backticks (```json ... ```) 
        // This is the #1 reason for 500 errors!
        const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const aiData = JSON.parse(cleanedJson);
            console.log(`✅ AI Analysis complete for ${deviceId}`);
            res.json(aiData);
        } catch (parseError) {
            console.error("❌ AI sent invalid JSON format:", text);
            res.status(500).json({ error: "AI formatting error. Please try again." });
        }

    } catch (error) {
        // This will print the EXACT error to your Docker Terminal
        console.error("❌ CRITICAL AI CONTROLLER ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
};