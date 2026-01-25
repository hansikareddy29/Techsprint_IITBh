// controllers/analystService.js
const db = require('../config/firebase-config');
const model = require('../config/gemini-config');

/**
 * Analyzes last 100 logs to build long-term memory for AI.
 */
exports.generateLongTermTrend = async (deviceId) => {
  try {
    console.log(`🧠 [Analyst] Building Long-Term Memory for: ${deviceId}`);

    const snapshot = await db.collection('battery_logs')
      .where('deviceId', '==', deviceId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    if (snapshot.empty) return null;

    const logs = snapshot.docs.map(doc => doc.data());

    const prompt = `
      Analyze these 100 hardware logs for device: ${deviceId}.
      
      IDENTIFY TRENDS:
      1. Is there a pattern of high RAM usage even when CPU is low?
      2. Is the battery health dropping unusually fast relative to cycles?
      3. Are there specific apps that repeatedly appear as culprits over several days?

      Summarize this device's "Health History" in 3 clear bullet points.
      DATA: ${JSON.stringify(logs)}
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await db.collection('device_summaries')
      .doc(deviceId)
      .set({
        deviceId,
        longTermAnalysis: summary,
        lastUpdated: new Date().toISOString()
      });

    console.log(`✅ [Analyst] Memory Updated for ${deviceId}`);
    return summary;
  } catch (error) {
    console.error("❌ Analyst Service Error:", error.message);
    return null;
  }
};
