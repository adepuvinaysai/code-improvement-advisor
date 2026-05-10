const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAllModels() {
  const genAI = new GoogleGenerativeAI('AIzaSyDnS_ZYCYE39Zva5MGTk4qUFrx60VQ8BIg');
  try {
    // The SDK doesn't expose listModels directly easily in some versions, 
    // but we can try to fetch it via a raw fetch if needed.
    // However, let's try gemini-1.5-flash-latest or gemini-1.5-flash-8b
    console.log("Checking specific versions...");
    const models = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-001', 'gemini-1.5-flash-002'];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ ${m} works!`);
        return;
      } catch (e) {
        console.log(`❌ ${m}: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

listAllModels();
