// build.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// --- NEW DYNAMIC CONFIG ---
const COMPONENT_PATH = process.argv[2];
const ANALYSIS_PATH = './analysis.json';

if (!COMPONENT_PATH) {
  console.error("❌ Error: You must provide a component path!");
  process.exit(1);
}

async function buildPreview() {
  console.log("🏗️  Starting Smart Build Process...");

  // 1. READ THE AI ANALYSIS
  // We need to know both the 'props' and the 'wrappers' requirements
  if (!fs.existsSync(ANALYSIS_PATH)) {
    console.error("❌ Analysis file not found. Run analyze.js first!");
    process.exit(1);
  }
  const analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
  const { props, wrappers } = analysis;

  console.log("🧠 AI Config Loaded:", wrappers);

  // 2. PREPARE WRAPPERS
  // We dynamically build the strings for imports and wrapping tags
  let extraImports = [];
  let wrapperStart = '';
  let wrapperEnd = '';

  // Logic: If 'router' is needed, add BrowserRouter
  if (wrappers.router) {
    extraImports.push("import { BrowserRouter } from 'react-router-dom';");
    wrapperStart += '<BrowserRouter>';
    wrapperEnd = '</BrowserRouter>' + wrapperEnd;
  }

  // (Future expansion: If 'redux' is true, add <Provider> here)

  // 3. FIND CSS (Style Sniffer from before)
  const cssFiles = glob.sync('src/**/*.css');
  const cssImports = cssFiles.map(file => `import './${file}';`).join('\n');

  // 4. GENERATE THE REACT WRAPPER
  const entryContent = `
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    ${cssImports}
    ${extraImports.join('\n')} 
    import TargetComponent from '${COMPONENT_PATH}'; 

    // We embed the mock data directly from the analysis
    const mockProps = ${JSON.stringify(props)};

    ReactDOM.createRoot(document.getElementById('root')).render(
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Smart Preview</h1>
        <hr />
        <br />
        {/* The wrapper strings (like <BrowserRouter>) are injected here */}
        ${wrapperStart}
          <TargetComponent {...mockProps} />
        ${wrapperEnd}
      </div>
    );
  `;

  fs.writeFileSync('preview-main.jsx', entryContent);
  console.log("✅ Created smart React entry point.");

  // 5. GENERATE HTML (Standard)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smart AI Preview</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/preview-main.jsx"></script>
      </body>
    </html>
  `;
  fs.writeFileSync('index.html', htmlContent);

  // 6. RUN VITE
  try {
    execSync('npx vite build', { stdio: 'inherit' }); 
    console.log("🎉 Build Complete!");
  } catch (error) {
    console.error("❌ Build Failed:", error.message);
  }
}

buildPreview();