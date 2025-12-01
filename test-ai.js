require('dotenv').config(); // Load the key from .env file
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function runTest() {
  try {
    console.log("🚀 Connecting to Gemini...");

    // 1. Initialize the client using your secure key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Select the 'flash' model (it's fast and free)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // 3. Define the prompt
    const prompt = "Generate a JSON object for a 'UserCard' component with props: name, role, and avatarUrl. Output ONLY JSON.";

    // 4. Send the request
    console.log("📤 Sending prompt...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // 5. Print the result
    console.log("\n✅ AI Response:\n");
    console.log(response.text());

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runTest();