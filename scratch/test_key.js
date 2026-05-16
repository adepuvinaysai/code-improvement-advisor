const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDnS_ZYCYE39Zva5MGTk4qUFrx60VQ8BIg');
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.log("FAILURE:", e.message);
  }
}
test();
