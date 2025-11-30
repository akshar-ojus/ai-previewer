// build.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

const ANALYSIS_PATH = './analysis.json';

async function buildDashboard() {
  console.log("🏗️  Starting Dashboard Build...");

  if (!fs.existsSync(ANALYSIS_PATH)) {
    console.error("❌ No analysis file found.");
    process.exit(1);
  }

  const analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
  const files = Object.keys(analysis);
  const inputs = {}; // We will pass this to Vite
  const links = [];  // For the dashboard

  // 1. FIND CSS (Global Sniffer)
  const cssFiles = glob.sync('src/**/*.css');
  const cssImports = cssFiles.map(f => `import './${f}';`).join('\n');

  // 2. LOOP THROUGH EVERY FILE
  files.forEach((filePath, index) => {
    const data = analysis[filePath];
    const safeName = path.basename(filePath, path.extname(filePath)); // e.g. "UserCard"
    const entryName = `preview-${safeName}.jsx`;
    const htmlName = `preview-${safeName}.html`;

    // A. Generate Wrappers (Same logic as before)
    let extraImports = [];
    let wrapperStart = '';
    let wrapperEnd = '';
    if (data.wrappers?.router) {
      extraImports.push("import { BrowserRouter } from 'react-router-dom';");
      wrapperStart += '<BrowserRouter>';
      wrapperEnd = '</BrowserRouter>';
    }

    // B. Generate Entry JSX
    const entryContent = `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      ${cssImports}
      ${extraImports.join('\n')}
      import TargetComponent from './${filePath}';
      const mockProps = ${JSON.stringify(data.props)};

      ReactDOM.createRoot(document.getElementById('root')).render(
        <div style={{ padding: '20px' }}>
          ${wrapperStart}
            <TargetComponent {...mockProps} />
          ${wrapperEnd}
        </div>
      );
    `;
    fs.writeFileSync(entryName, entryContent);

    // C. Generate HTML Page
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

    // D. Add to lists
    inputs[safeName] = path.resolve(__dirname, htmlName);
    links.push(`<li><a href="${htmlName}" style="font-size: 1.2rem; display: block; margin: 10px 0;">🔭 Preview <b>${safeName}</b></a></li>`);
  });

  // 3. GENERATE DASHBOARD (Main Index)
  const dashboardHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Preview Dashboard</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
          ul { list-style: none; padding: 0; }
          li a { text-decoration: none; color: #007bff; border: 1px solid #eee; padding: 15px; border-radius: 8px; transition: 0.2s; }
          li a:hover { background: #f9f9f9; border-color: #ccc; }
        </style>
      </head>
      <body>
        <h1>🚀 AI Preview Dashboard</h1>
        <p>The following components were modified in this PR:</p>
        <ul>${links.join('')}</ul>
      </body>
    </html>
  `;
  fs.writeFileSync('index.html', dashboardHTML);
  inputs['main'] = path.resolve(__dirname, 'index.html');

  // 4. GENERATE VITE CONFIG DYNAMICALLY
  // We need a specific config to tell Vite about multiple input files
  const viteConfigContent = `
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      base: './',
      build: {
        rollupOptions: {
          input: ${JSON.stringify(inputs)}
        }
      }
    });
  `;
  fs.writeFileSync('vite.multi.config.js', viteConfigContent);

  // 5. RUN BUILD
  try {
    execSync('npx vite build --config vite.multi.config.js', { stdio: 'inherit' });
    console.log("🎉 Dashboard Build Complete!");
  } catch (err) {
    console.error("❌ Build Failed:", err.message);
  }
}

buildDashboard();