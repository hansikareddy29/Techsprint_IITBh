// controllers/aiController.js
const db = require('../config/firebase-config');
const model = require('../config/gemini-config');
const analyst = require('./analystService');

const diagnosisCache = {};

exports.getDiagnosis = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const now = Date.now();

    // 1. Cache check (15 min)
    if (diagnosisCache[deviceId] &&
        (now - diagnosisCache[deviceId].time < 900000)) {
      console.log(`📦 Serving Cached AI Report for ${deviceId}`);
      return res.json(diagnosisCache[deviceId].data);
    }

    // 2. Last 10 logs (live telemetry)
    const liveSnapshot = await db.collection('battery_logs')
      .where('deviceId', '==', deviceId.trim())
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    if (liveSnapshot.empty) {
      return res.status(404).json({ error: "No recent telemetry data found." });
    }
    const liveLogs = liveSnapshot.docs.map(doc => doc.data());

    // 3. Long term memory
    const summaryDoc = await db.collection('device_summaries')
      .doc(deviceId)
      .get();

    const historyMemory = summaryDoc.exists
      ? summaryDoc.data().longTermAnalysis
      : "No previous history recorded. Treat this as the first baseline analysis.";

    // 4. Prompt
    console.log(`🤖 Requesting Smarter AI Diagnosis for ${deviceId}...`);

    const prompt = `
      You are a senior hardware diagnostic expert. 
      Your goal is to provide a "Current Health Diagnosis" for "${deviceId}"
      by comparing live data against its historical baseline.

      USER'S LONG-TERM HISTORY (Historical Patterns):
      ${historyMemory}

      CURRENT LIVE TELEMETRY (Last 10 minutes):
      ${JSON.stringify(liveLogs)}

      INSTRUCTIONS:
      1. Analyze the Current Telemetry for high CPU/RAM usage or rapid battery drain.
      2. Compare these current values against the Long-Term History. 
      3. Determine if today's issues are a "New Deviation" (unusual) or a "Persistent Trend" (happening for a long time).
      4. Provide an "Overall Score" (0-100) where 100 is perfect health.

      Return ONLY a valid JSON object. No markdown, no backticks.
      Structure:
      {
        "overallScore": (number),
        "summary": "Explain how today's data compares to the historical baseline",
        "culprits": ["App Name 1", "App Name 2"],
        "actionPlan": [
          { "step": "BOLD HIGHLIGHT (3-5 words)", "description": "Specific technical instruction" },
          { "step": "BOLD HIGHLIGHT (3-5 words)", "description": "Specific technical instruction" },
          { "step": "BOLD HIGHLIGHT (3-5 words)", "description": "Specific technical instruction" }
        ]
      }
    `;

    // 5. Call model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 6. Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON.");
    const aiData = JSON.parse(jsonMatch[0]);

    // 7. Cache
    diagnosisCache[deviceId] = { time: now, data: aiData };

    // 8. Background long term refresh
    analyst.generateLongTermTrend(deviceId);

    console.log(`✅ [${deviceId}] Diagnosis complete. Overall Health: ${aiData.overallScore}`);
    res.json(aiData);
  } catch (error) {
    console.error("❌ AI DIAGNOSIS ERROR:", error.message);
    res.status(500).json({
      overallScore: "!!",
      summary: "AI Diagnosis is currently refreshing its memory. Please try again in 1 minute.",
      culprits: ["N/A"],
      actionPlan: [
        { step: "System Busy", description: "The AI is processing large amounts of history data. Please refresh the page." }
      ]
    });
  }
};
