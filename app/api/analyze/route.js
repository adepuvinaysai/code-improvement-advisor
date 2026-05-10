import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const repo = match[2].replace(/\.git$/, '');
  return { owner: match[1], repo };
}

export async function POST(req) {
  try {
    const { url, files: requestedFiles, mode } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const repoInfo = parseGithubUrl(url);
    if (!repoInfo) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const { owner, repo } = repoInfo;
    const clientToken = req.headers.get('X-GitHub-Token');
    const githubToken = clientToken || process.env.GITHUB_TOKEN;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Syntaq-io'
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Fetch branch and tree logic (cached/simplified for this step)
    let branch = 'main';
    let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    let treeResponse = await fetch(treeUrl, { headers });

    if (!treeResponse.ok) {
      branch = 'master';
      treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      treeResponse = await fetch(treeUrl, { headers });
    }

    const treeData = await treeResponse.json();
    let files = [];

    if (requestedFiles && Array.isArray(requestedFiles) && requestedFiles.length > 0) {
      files = requestedFiles.map(path => ({ path }));
    } else if (treeData.tree && Array.isArray(treeData.tree)) {
      const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs'];
      files = treeData.tree.filter(item => 
        item.type === 'blob' && 
        validExtensions.some(ext => item.path.endsWith(ext)) &&
        !item.path.includes('node_modules')
      ).slice(0, 3);
    } else {
      return NextResponse.json({ error: 'Could not access repository tree. Please check the URL and permissions.' }, { status: 404 });
    }

    const fileContents = await Promise.all(
      files.map(async (file) => {
        const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`;
        const res = await fetch(contentUrl, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          path: file.path,
          content: Buffer.from(data.content, 'base64').toString('utf-8')
        };
      })
    );

    const combinedCode = fileContents
      .filter(f => f !== null)
      .map(f => `--- FILE: ${f.path} ---\n${f.content}`)
      .join('\n\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Upgraded to 2.0 Flash for forward-compatibility

    const PERSONAS = {
      sentinel: "You are the Sentinel Security Auditor. Your primary focus is OWASP vulnerabilities, data leaks, and encryption. Prioritize security in your scorecard.",
      optimizer: "You are the Runtime Optimizer. Your primary focus is algorithmic complexity, memory management, and speed. Prioritize performance in your scorecard.",
      mentor: "You are the Dev Mentor. Your primary focus is readability, documentation, and clean code principles. Prioritize maintainability in your scorecard.",
      standard: "You are an expert Principal Software Engineer and Security Auditor. Provide a balanced audit."
    };

    const prompt = `
${PERSONAS[mode] || PERSONAS.standard}
Analyze the provided code and generate a comprehensive Code Quality & Security Report.

### Report Structure:
1. **Executive Summary**: A high-level overview.
2. **Scorecard**: Grades (A-F) for Maintainability, Security, and Performance.
3. **Detailed Findings**: Categorized issues with fixes.
4. **Action Plan**: Prioritized steps.

### DATA BLOCK (CRITICAL):
At the very end of your response, include this EXACT JSON block:
\`\`\`json
{
  "metrics": { "overallScore": 85, "securityScore": 90, "maintainabilityScore": 80, "performanceScore": 85 },
  "qualityGates": { "security": "passed", "reliability": "passed", "maintainability": "warning", "coverage": "not_measured" },
  "summary": { "criticalIssues": 0, "majorIssues": 2, "minorIssues": 5 },
  "fileScores": { "path/to/file.js": 85 }
}
\`\`\`

Code:
${combinedCode}
`;

    // Initialize Streaming
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
        'X-Code-Context': Buffer.from(combinedCode).toString('base64'), // Send as header to avoid messing with text stream
      },
    });

  } catch (err) {
    console.error('Streaming error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
