import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { url, files: requestedFiles, combinedCode } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Define Specialized Agent Prompts
    const agents = [
      {
        name: 'Security Auditor',
        prompt: `Focus ONLY on Security. Audit the following code for OWASP vulnerabilities, secrets, and injection risks: \n\n${combinedCode}`
      },
      {
        name: 'Performance Guru',
        prompt: `Focus ONLY on Performance. Audit the following code for runtime complexity, memory leaks, and scalability bottlenecks: \n\n${combinedCode}`
      },
      {
        name: 'Software Architect',
        prompt: `Focus ONLY on Architecture. Audit the following code for SOLID principles, design patterns, and maintainability: \n\n${combinedCode}`
      }
    ];

    // Run parallel analyses
    const agentReports = await Promise.all(
      agents.map(async (agent) => {
        const result = await model.generateContent(agent.prompt);
        return { name: agent.name, report: result.response.text() };
      })
    );

    // Synthesis Agent
    const synthesisPrompt = `
You are the Lead Principal Architect. 
Below are three specialized reports from a Security Auditor, a Performance Guru, and a Software Architect.
Your task is to synthesize these into a single, high-impact Executive Code Quality Report.

--- SPECIALIZED REPORTS ---
${agentReports.map(r => `### ${r.name} Findings:\n${r.report}`).join('\n\n')}
--- END REPORTS ---

### Output Format:
1. **Executive Summary**: A unified verdict.
2. **Consolidated Dashboard**: Synthesized scores and gates.
3. **Consolidated Findings**: The most critical issues from all experts.

### DATA BLOCK (CRITICAL):
At the very end of your response, include this EXACT JSON block:
\`\`\`json
{
  "metrics": { "overallScore": 85, "securityScore": 90, "maintainabilityScore": 80, "performanceScore": 85 },
  "qualityGates": { "security": "passed", "reliability": "passed", "maintainability": "warning", "coverage": "not_measured" },
  "summary": { "criticalIssues": 1, "majorIssues": 3, "minorIssues": 4 },
  "fileScores": { "path/to/file.js": 85 }
}
\`\`\`
`;

    const result = await model.generateContentStream(synthesisPrompt);
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(new TextEncoder().encode(chunk.text()));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Code-Context': Buffer.from(combinedCode).toString('base64'),
      },
    });

  } catch (err) {
    console.error('Multi-agent error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
