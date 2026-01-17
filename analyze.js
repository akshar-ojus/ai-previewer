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
        You are a Full-Stack Data Mocking Expert. 
        
        PROJECT CONTEXT:
        ${projectContext}

        TARGET COMPONENT:
        Filename: "${filename}"
        Is TypeScript: ${isTS}

        TASK:
        1. Analyze props (like before).
        2. **NEW:** Analyze the code for network calls (fetch, axios, api.* calls).
        3. Infer the **Response Structure** those calls expect based on how the variables are used in the JSX (e.g. if code uses 'data.user.name', the mock MUST be { user: { name: "..." } }).

        STRICT GUIDELINES:
        1. **Network Mocks:** If the component fetches data, generate a 'network_mocks' object.
           - Key: The URL path (e.g., "/api/user", "/api/tasks"). Use "*" if the URL is dynamic.
           - Value: The JSON response object.
        2. **Realism:** Use realistic data (names, dates, prices).
        3. **Images:** Use valid placeholders (placehold.co, ui-avatars.com).
        
        Output JSON format:
        {
          "props": { ... },
          "wrappers": { "router": boolean, "redux": boolean, "query": boolean },
          "network_mocks": [
             { "url_pattern": "string (regex-like or partial match)", "method": "GET", "response": { ...json... } }
          ]
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
      masterAnalysis[filePath] = { props: {}, wrappers: {}, network_mocks: [] }; 
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(masterAnalysis, null, 2));
  console.log(`✅ Analysis complete!`);
}

analyzeAll();