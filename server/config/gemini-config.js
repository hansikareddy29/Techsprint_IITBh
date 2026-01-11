const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use 'gemini-1.5-flash' - this is the correct ID for the latest SDK
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = model;