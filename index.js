// index.js
const { execSync } = require('child_process');

// Capture ALL arguments (e.g. src/UserCard.jsx src/SmartLink.jsx)
const targetFiles = process.argv.slice(2).join(' ');

if (!targetFiles) {
  console.error("❌ Error: No files specified.");
  process.exit(1);
}

console.log(`🚀 Starting AI Dashboard for: ${targetFiles}`);

try {
  console.log("\n--- STEP 1: ANALYZING ---");
  execSync(`node analyze.js ${targetFiles}`, { stdio: 'inherit' });

  console.log("\n--- STEP 2: BUILDING ---");
  // build.js reads the analysis.json, so it doesn't strictly need args, 
  // but we can pass them if we ever need to. For now, no args needed.
  execSync(`node build.js`, { stdio: 'inherit' });

  console.log("\n✅ DONE! Run 'npx vite preview' to see the dashboard.");

} catch (error) {
  console.error("\n❌ Execution failed.");
  process.exit(1);
}