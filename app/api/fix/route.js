import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { codeSnippet, issueDescription, fileName } = await req.json();

    if (!codeSnippet || !issueDescription) {
      return NextResponse.json({ error: 'Code snippet and issue description are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
You are a world-class Principal Engineer.
Refactor the following code snippet from the file "${fileName || 'unknown'}" to address this specific issue:
Issue: ${issueDescription}

Requirements:
1. Apply the fix while maintaining the original coding style and indentation.
2. Ensure the code is production-ready, performant, and secure.
3. RETURN ONLY THE REFACTORED CODE BLOCK. No explanations, no markdown formatting like \`\`\`javascript. Just the raw code.

Original Code Snippet:
${codeSnippet}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const refactoredCode = response.text().trim();

    return NextResponse.json({ refactoredCode });

  } catch (err) {
    console.error('Refactor API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
