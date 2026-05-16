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

async function list() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_key_here') {
    console.log("Error: Please set GEMINI_API_KEY in .env.local");
    return;
  }
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + key;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log("Available Models:", data.models.map(m => m.name));
    } else {
      console.log("API Error:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("Fetch Error:", e.message);
  }
}
list();
