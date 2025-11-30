require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
// We will eventually make this dynamic, but for now let's keep testing with UserCard

// --- OLD HARDCODED CONFIG ---
// const COMPONENT_PATH = './src/SmartLink.jsx';

// --- NEW DYNAMIC CONFIG ---
// process.argv[2] is the first argument passed after "node analyze.js"
const COMPONENT_PATH = process.argv[2];
const OUTPUT_PATH = './analysis.json'; // Changed from mock-data.json

if (!COMPONENT_PATH) {
  console.error("❌ Error: You must provide a component path!");
  console.error("Usage: node analyze.js ./src/YourComponent.jsx");
  process.exit(1);
}

async function generateSmartAnalysis() {
  try {
    console.log(`📖 Reading component from ${COMPONENT_PATH}...`);
    const componentCode = fs.readFileSync(COMPONENT_PATH, 'utf8');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Remember to use the model name that worked for you!
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    // --- THE UPGRADED PROMPT ---
    const prompt = `
      You are an expert React System. Analyze the following component code.
      
      Your goal is to output a JSON object with two parts:
      1. "props": Realistic mock data for the component's props.
      2. "wrappers": A boolean list of environment requirements.
         - Set "router": true if the code uses 'react-router', 'Link', 'useNavigate', etc.
         - Set "redux": true if the code uses 'react-redux', 'useSelector', 'useDispatch'.
         - Set "query": true if the code uses 'react-query'.

      Output ONLY valid JSON. No markdown.

      Component Code:
      ${componentCode}
    `;

    console.log("🧠 Analyzing code for Data AND Context...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean output
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    fs.writeFileSync(OUTPUT_PATH, text);
    console.log(`✅ Smart Analysis saved to: ${OUTPUT_PATH}`);
    console.log("Preview:", text);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

generateSmartAnalysis();