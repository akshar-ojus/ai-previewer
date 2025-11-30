// build.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

const ANALYSIS_PATH = './analysis.json';

async function buildDashboard() {
  console.log("🏗️  Starting React Dashboard Build...");

  if (!fs.existsSync(ANALYSIS_PATH)) {
    console.error("❌ No analysis file found. Run analyze.js first!");
    process.exit(1);
  }

  const analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
  const files = Object.keys(analysis);
  
  // This object will tell Vite about all the different pages we are building
  const viteInputs = {}; 
  
  // This array will hold the data we pass to your React Dashboard
  const dashboardData = [];

  // 1. FIND GLOBAL CSS (Style Sniffer)
  // We inject this into every preview so components look correct
  const cssFiles = glob.sync('src/**/*.css');
  const cssImports = cssFiles.map(f => `import './${f}';`).join('\n');

  console.log(`🎨 Injecting ${cssFiles.length} CSS files into previews.`);

  // 2. LOOP THROUGH EVERY CHANGED FILE
  files.forEach((filePath) => {
    const data = analysis[filePath];
    const safeName = path.basename(filePath, path.extname(filePath)); // e.g. "UserCard"
    
    // Naming conventions for temporary files
    const entryName = `preview-${safeName}.jsx`;
    const htmlName = `preview-${safeName}.html`;

    // A. Generate Wrappers (Router, etc.)
    let extraImports = [];
    let wrapperStart = '';
    let wrapperEnd = '';
    
    if (data.wrappers?.router) {
      extraImports.push("import { BrowserRouter } from 'react-router-dom';");
      wrapperStart += '<BrowserRouter>';
      wrapperEnd = '</BrowserRouter>';
    }

    // B. Generate the React Entry Point for this specific component
    const entryContent = `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      ${cssImports}
      ${extraImports.join('\n')}
      import TargetComponent from './${filePath}';
      
      const mockProps = ${JSON.stringify(data.props)};

      ReactDOM.createRoot(document.getElementById('root')).render(
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          ${wrapperStart}
            <TargetComponent {...mockProps} />
          ${wrapperEnd}
        </div>
      );
    `;
    fs.writeFileSync(entryName, entryContent);

    // C. Generate the HTML Container for this preview
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><title>Preview: ${safeName}</title></head>
        <body>
          <div id="root"></div>
          <script type="module" src="/${entryName}"></script>
        </body>
      </html>
    `;
    fs.writeFileSync(htmlName, htmlContent);

    // D. Register this page for Vite and the Dashboard
    viteInputs[safeName] = path.resolve(__dirname, htmlName);
    
    dashboardData.push({
      name: safeName,
      url: htmlName, // Relative link
      originalPath: filePath
    });
  });

  // 3. GENERATE THE DATA FILE (The Bridge)
  // This creates the file that your src/Dashboard.jsx imports!
  const dataFileContent = `export const previews = ${JSON.stringify(dashboardData, null, 2)};`;
  fs.writeFileSync('src/dashboard.data.js', dataFileContent);
  console.log("✅ Generated src/dashboard.data.js");

  // 4. GENERATE MAIN INDEX.HTML
  // This loads your React Dashboard
  const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Preview Dashboard</title>
        <style>body { margin: 0; background-color: #f8f9fa; }</style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/Dashboard.jsx"></script>
      </body>
    </html>
  `;
  fs.writeFileSync('index.html', dashboardHtml);
  viteInputs['main'] = path.resolve(__dirname, 'index.html');

  // 5. GENERATE VITE CONFIG
  // We need a specific config to handle multiple inputs
  const viteConfigContent = `
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      base: './', // Essential for GitHub Pages relative links
      build: {
        rollupOptions: {
          input: ${JSON.stringify(viteInputs)}
        }
      }
    });
  `;
  fs.writeFileSync('vite.multi.config.js', viteConfigContent);

  // 6. RUN THE BUILD
  try {
    console.log("📦 Running Vite Build...");
    execSync('npx vite build --config vite.multi.config.js', { stdio: 'inherit' });
    console.log("🎉 Dashboard Build Complete!");
  } catch (err) {
    console.error("❌ Build Failed:", err.message);
  }
}

buildDashboard();