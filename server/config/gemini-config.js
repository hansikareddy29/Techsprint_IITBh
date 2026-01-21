// // const { GoogleGenerativeAI } = require("@google/generative-ai");
// // require('dotenv').config();

// // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // // Use 'gemini-1.5-flash' - this is the correct ID for the latest SDK
// // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// // module.exports = model;
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// // Using 1.5-flash for speed or 1.5-pro for depth
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// module.exports = model;
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use 'gemini-1.5-flash-latest' which is more reliable across SDK versions
// If this still gives a 404, change it to "gemini-pro"
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = model;