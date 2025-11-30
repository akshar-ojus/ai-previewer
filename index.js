const { execSync } = require('child_process');

// Get the file path from the command line (e.g., "src/UserCard.jsx")
const targetFile = process.argv[2];

if (!targetFile) {
  console.error("❌ Error: Please specify a file to preview.");
  console.error("Example: npm run preview src/UserCard.jsx");
  process.exit(1);
}

console.log(`🚀 Starting AI Preview for: ${targetFile}`);

try {
  // Pass the targetFile argument to the analyzer
  console.log("\n--- STEP 1: ANALYZING ---");
  execSync(`node analyze.js ${targetFile}`, { stdio: 'inherit' });

  // Pass the targetFile argument to the builder
  console.log("\n--- STEP 2: BUILDING ---");
  execSync(`node build.js ${targetFile}`, { stdio: 'inherit' });

  console.log("\n✅ DONE! Run 'npx vite preview' to see the result.");

} catch (error) {
  console.error("\n❌ Execution failed.");
  process.exit(1);
}