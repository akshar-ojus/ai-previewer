const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

const ANALYSIS_PATH = './analysis.json';

// Find the Vite binary inside the Action's node_modules
const VITE_BIN = path.resolve(__dirname, 'node_modules', '.bin', 'vite');

async function buildDashboard() {
  console.log("🏗️  Starting React Dashboard Build...");

  if (!fs.existsSync(ANALYSIS_PATH)) {
    console.error("❌ No analysis file found.");
    process.exit(1);
  }

  const analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
  const files = Object.keys(analysis);
  const viteInputs = {}; 
  const dashboardData = [];

  // 1. FIND GLOBAL CSS
  const cssFiles = glob.sync('src/**/*.css');
  const cssImports = cssFiles.map(f => `import './${f}';`).join('\n');

  // 2. LOOP THROUGH FILES
  files.forEach((filePath) => {
    const data = analysis[filePath];
    const safeName = path.basename(filePath, path.extname(filePath));
    const entryName = `preview-${safeName}.jsx`;
    const htmlName = `preview-${safeName}.html`;

    let extraImports = [];
    let wrapperStart = '';
    let wrapperEnd = '';
    
    if (data.wrappers?.router) {
      extraImports.push("import { BrowserRouter } from 'react-router-dom';");
      wrapperStart += '<BrowserRouter>';
      wrapperEnd = '</BrowserRouter>';
    }

    const entryContent = `
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      ${cssImports}
      ${extraImports.join('\n')}
      import TargetComponent from './${filePath}';
      
      const mockProps = ${JSON.stringify(data.props)};

      ReactDOM.createRoot(document.getElementById('root')).render(
        <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: '100%' }}>
            ${wrapperStart}
              <TargetComponent {...mockProps} />
            ${wrapperEnd}
          </div>
        </div>
      );
    `;
    fs.writeFileSync(entryName, entryContent);

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

    viteInputs[safeName] = path.resolve(process.cwd(), htmlName); // Use CWD for resolving inputs
    dashboardData.push({ name: safeName, url: htmlName, originalPath: filePath });
  });

  // 3. GENERATE DATA & DASHBOARD
  const dataFileContent = `export const previews = ${JSON.stringify(dashboardData, null, 2)};`;
  fs.writeFileSync('src/dashboard.data.js', dataFileContent);

  const dashboardHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8" /><title>MockMirror Dashboard</title></head>
      <body><div id="root"></div><script type="module" src="/src/Dashboard.jsx"></script></body>
    </html>
  `;
  fs.writeFileSync('index.html', dashboardHtml);
  viteInputs['main'] = path.resolve(process.cwd(), 'index.html');

  // 4. GENERATE VITE CONFIG
  const viteConfigContent = `
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    export default defineConfig({
      plugins: [react()],
      base: './',
      build: { rollupOptions: { input: ${JSON.stringify(viteInputs)} } }
    });
  `;
  fs.writeFileSync('vite.multi.config.js', viteConfigContent);

  // 5. RUN BUILD
  try {
    console.log("📦 Running Vite Build...");
    // Use the specific VITE_BIN path we found earlier
    execSync(`"${VITE_BIN}" build --config vite.multi.config.js`, { stdio: 'inherit' });
    console.log("🎉 Dashboard Build Complete!");
  } catch (err) {
    console.error("❌ Build Failed:", err.message);
  }
}

buildDashboard();