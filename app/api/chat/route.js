import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { report, messages } = await req.json();

    if (!report || !messages) {
      return NextResponse.json({ error: 'Report and messages are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // System prompt with context
    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map(m => m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`).join('\n');

    const prompt = `
You are an expert Principal Software Engineer and Security Auditor helping a developer understand their code quality report.
Context: You previously analyzed the user's code and generated this report:
--- START REPORT ---
${report}
--- END REPORT ---

Conversation History:
${history}

User Question: ${lastMessage}

Please provide a concise, helpful, and technically accurate answer based on the report and the code context. Use markdown formatting.
`;

    const result = await model.generateContentStream(prompt);
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
