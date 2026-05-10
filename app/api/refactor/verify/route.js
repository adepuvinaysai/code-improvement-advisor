import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { issue, originalCode, newCode } = await req.json();

    if (!issue || !newCode) {
      return NextResponse.json({ error: 'Issue and refactored code are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a Senior QA Engineer and Security Auditor.
A developer has proposed a refactor to fix a specific issue. Your task is to verify if the issue was actually resolved.

### Original Issue:
${issue}

### Original Code:
${originalCode}

### Refactored Code:
${newCode}

### Response Format (JSON only):
{
  "verified": true/false,
  "comment": "A brief explanation of why it is or isn't fixed.",
  "confidence": 0-100
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up possible markdown in response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return NextResponse.json(data);

  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
