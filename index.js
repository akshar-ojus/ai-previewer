const { execSync } = require('child_process');
const path = require('path');

// Capture ALL arguments
const targetFiles = process.argv.slice(2).join(' ');

if (!targetFiles) {
  console.error("❌ Error: No files specified.");
  process.exit(1);
}

// Get the directory where THIS script lives (The Action folder)
const scriptDir = __dirname;

console.log(`🚀 Starting MockMirror for: ${targetFiles}`);

try {
  console.log("\n--- STEP 1: ANALYZING ---");
  // Run analyze.js from the scriptDir
  execSync(`node "${path.join(scriptDir, 'analyze.js')}" ${targetFiles}`, { stdio: 'inherit' });

  console.log("\n--- STEP 2: BUILDING ---");
  // Run build.js from the scriptDir
  execSync(`node "${path.join(scriptDir, 'build.js')}"`, { stdio: 'inherit' });

  console.log("\n✅ DONE! Preview build complete.");

} catch (error) {
  console.error("\n❌ Execution failed:", error.message);
  process.exit(1);
}