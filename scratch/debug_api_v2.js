const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

function loadEnv() {
  const envPath = '.env.local';
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const [key, ...value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.join('=').trim();
      }
    });
  }
}
loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hello");
      console.log(`✅ ${m} SUCCESS: `, result.response.text().substring(0, 20));
      return;
    } catch (e) {
      console.log(`❌ ${m} FAILURE: `, e.message);
    }
  }
}
test();
