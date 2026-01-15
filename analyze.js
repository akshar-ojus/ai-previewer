require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const FILES = process.argv.slice(2);
const OUTPUT_PATH = './analysis.json';

if (FILES.length === 0) {
  console.error("❌ No files provided to analyze.");
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- STEP 1: GATHER GLOBAL CONTEXT ---
let projectContext = "Unknown React Application";

try {
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    projectContext = `Project Name: "${pkg.name || 'Unnamed'}"\nDescription: "${pkg.description || ''}"`;
    const deps = Object.keys(pkg.dependencies || {}).join(', ');
    projectContext += `\nKey Libraries: ${deps}`;
  }

  if (fs.existsSync('README.md')) {
    const readme = fs.readFileSync('README.md', 'utf8');
    projectContext += `\n\nREADME Summary:\n${readme.substring(0, 3000)}...`;
  }
} catch (e) {
  console.warn("⚠️ Could not read project context files.");
}

async function analyzeAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

  const masterAnalysis = {};

  console.log(`🧠 Starting Context-Aware Analysis for ${FILES.length} files...`);

  for (const filePath of FILES) {
    if (!fs.existsSync(filePath)) continue;

    try {
      console.log(`   👉 Analyzing: ${filePath}`);
      const code = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      const isTS = filePath.endsWith('.tsx');

      // --- STEP 2: CONSTRUCT PROMPT ---
      const prompt = `
        You are a Senior Seed Data Generator. Your job is to create realistic, production-ready mock data for UI components.
        
        PROJECT CONTEXT:
        ${projectContext}

        TARGET COMPONENT:
        Filename: "${filename}"
        Is TypeScript: ${isTS}

        TASK:
        Analyze the component code and generate a JSON object containing 'props' and 'wrappers'.

        STRICT DATA GUIDELINES (DO NOT IGNORE):
        1. **Realism is Mandatory:** NEVER use "Lorem Ipsum", "Test Title", "Sample Text", "Item 1", "Foo", or "Bar". 
           - If it's a Chat App, use messages like "Hey, are we still on for lunch?"
           - If it's an E-commerce App, use specific product names like "Sony WH-1000XM4 Wireless Headphones".
        2. **Lists & Arrays:** If the component displays a list (e.g., .map()), you MUST generate **4 to 6 unique items**.
           - Vary the status (e.g., one 'active', one 'pending', one 'failed').
           - Vary the lengths of text to test UI wrapping.
        3. **Working Images:** Use these services for visual props:
           - User Avatars: "https://ui-avatars.com/api/?name=Alice+Smith&background=random"
           - Products/Cover Images: "https://placehold.co/600x400?text=Product+Image"
        4. **Dates:** Use realistic past/future ISO dates if needed (e.g., "2023-10-15T09:00:00Z").
        5. **TypeScript:** Strictly follow any interfaces defined in the code.

        Output JSON format:
        {
          "props": { ... },
          "wrappers": { "router": boolean, "redux": boolean, "query": boolean }
        }

        COMPONENT CODE:
        ${code}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      masterAnalysis[filePath] = JSON.parse(text);

      if (FILES.length > 1) {
        process.stdout.write("      (Waiting 4s to avoid rate limit...)\n");
        await sleep(4000); 
      }

    } catch (err) {
      console.error(`   ❌ Failed to analyze ${filePath}: ${err.message}`);
      masterAnalysis[filePath] = { props: {}, wrappers: {} }; 
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(masterAnalysis, null, 2));
  console.log(`✅ Bulk Analysis complete! Saved to ${OUTPUT_PATH}`);
}

analyzeAll();