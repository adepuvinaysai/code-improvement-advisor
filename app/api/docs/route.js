import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { code, repoName } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code context is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are an expert Technical Writer and Software Architect.
Based on the provided source code for the project "${repoName || 'Project'}", generate a professional, high-quality README.md file.

### Required Sections:
1. **Title & Description**: Catchy title and a clear description of the project's purpose.
2. **Architecture Overview**: Explain how the components interact.
3. **Key Features**: List the main functionalities found in the code.
4. **API Reference/Usage**: Document the key functions, classes, and modules found in the provided files.
5. **Getting Started**: Standard instructions (npm install, etc. based on the file types).

Use clean, professional markdown with tables, lists, and code blocks where appropriate.

Code Context:
${code}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ markdown: text });

  } catch (err) {
    console.error('Docs generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
