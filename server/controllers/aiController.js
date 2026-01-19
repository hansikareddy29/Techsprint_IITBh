exports.getDiagnosis = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // 1. Fetch the 5 MOST RECENT logs (Order by timestamp DESC)
        const snapshot = await db.collection('battery_logs')
            .where('deviceId', '==', deviceId)
            .orderBy('timestamp', 'desc') // <-- THIS IS THE FIX
            .limit(5)
            .get();

        const logs = snapshot.docs.map(doc => doc.data());
        if (logs.length === 0) return res.json({ diagnosis: "Waiting for hardware data..." });

        const latest = logs[0];
        const apps = latest.top_apps ? latest.top_apps.join(', ') : "System Processes";

        // 2. Clearer Prompt for the AI
        const prompt = `
            Analyze the LATEST hardware state:
            Apps running: ${apps}. 
            CPU Load: ${latest.cpu_load}%. 
            Battery: ${latest.battery_level}%.
            
            Based on this specific data, why is the battery under stress RIGHT NOW? 
            Mention the heavy apps (like Chrome) if present.
            Format: REASON: ... | ADVICE: ... (Max 40 words)
        `;

        const result = await model.generateContent(prompt);
        res.json({ diagnosis: result.response.text() });

    } catch (error) {
        // Fallback logic
        res.json({ diagnosis: "AI is analyzing your patterns... Refresh in a moment." });
    }
};