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
console.log("API Key Length:", apiKey ? apiKey.length : 0);
console.log("API Key Prefix:", apiKey ? apiKey.substring(0, 7) : "NONE");

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent("Say hello");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.log("FAILURE:", e.message);
  }
}

test();
