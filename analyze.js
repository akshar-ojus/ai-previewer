// analyze.js
require('dotenv').config();
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get all arguments starting from index 2
const FILES = process.argv.slice(2);
const OUTPUT_PATH = './analysis.json';

if (FILES.length === 0) {
  console.error("❌ No files provided to analyze.");
  process.exit(1);
}

async function analyzeAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

  // We will store all results here
  const masterAnalysis = {};

  console.log(`🧠 Starting Bulk Analysis for ${FILES.length} files...`);

  for (const filePath of FILES) {
    try {
      console.log(`   👉 Analyzing: ${filePath}`);
      const code = fs.readFileSync(filePath, 'utf8');

      const prompt = `
        You are an expert React System. Analyze this code.
        Output JSON with:
        1. "props": Realistic mock data.
        2. "wrappers": Boolean list (router, redux, query).
        
        Output ONLY valid JSON.
        Code: ${code}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Save result using the filename as the key
      masterAnalysis[filePath] = JSON.parse(text);

    } catch (err) {
      console.error(`   ❌ Failed to analyze ${filePath}: ${err.message}`);
      // Fallback: empty props if AI fails
      masterAnalysis[filePath] = { props: {}, wrappers: {} }; 
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(masterAnalysis, null, 2));
  console.log(`✅ Bulk Analysis complete! Saved to ${OUTPUT_PATH}`);
}

analyzeAll();