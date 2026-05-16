import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_key_here') {
  console.warn('⚠️ GEMINI_API_KEY is not set or using placeholder. Please update .env.local');
}

export const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');

export const MODELS = {
  ANALYSIS: 'gemini-flash-latest', // Standard 1.5 Flash - Most reliable quota
  CHAT: 'gemini-flash-latest',
  FIX: 'gemini-flash-latest',
  DOCS: 'gemini-flash-latest',
  ULTRA: 'gemini-flash-latest',    // Changed from gemini-pro-latest to avoid 429 quotas
};

/**
 * Helper to call Gemini with exponential backoff for rate limiting (429)
 */
export async function withRetry(fn, maxRetries = 3) {
  let delay = 2000; // Start with 2s delay
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const errorText = err.message?.toLowerCase() || '';
      const isQuota = errorText.includes('quota') || errorText.includes('429');
      
      if (isQuota) {
        if (i < maxRetries - 1) {
          console.warn(`🚨 RATE LIMIT HIT. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; 
          continue;
        } else {
          console.error('❌ QUOTA EXHAUSTED: Please check your Google AI Studio billing or wait 60s.');
          throw new Error('Analysis Engine Quota Exceeded. Please try again in 60 seconds.');
        }
      }
      throw err;
    }
  }
}
