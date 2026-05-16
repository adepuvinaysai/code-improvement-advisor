import { NextResponse } from 'next/server';
import { genAI, MODELS, withRetry } from '@/lib/gemini';

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

    if (!treeResponse.ok) {
      const status = treeResponse.status;
      if (status === 403 || status === 429) {
        return NextResponse.json({ 
          error: 'GitHub Rate Limit Exceeded. Please add a GITHUB_TOKEN to .env.local to increase limits.' 
        }, { status: 403 });
      }
      if (status === 404) {
        return NextResponse.json({ 
          error: 'Repository not found. If it is private, please provide a valid GITHUB_TOKEN in .env.local.' 
        }, { status: 404 });
      }
      return NextResponse.json({ error: `GitHub API error: ${treeResponse.statusText}` }, { status });
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
      
      if (files.length === 0) {
        return NextResponse.json({ error: 'No supported source files found in the repository (.js, .ts, .py, .go, .rs).' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Failed to parse repository structure.' }, { status: 500 });
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

    const model = genAI.getGenerativeModel({ model: MODELS.ANALYSIS });

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
    const result = await withRetry(() => model.generateContentStream(prompt));

    const stream = new ReadableStream({
      async start(controller) {
        const encodedContext = Buffer.from(combinedCode).toString('base64');
        controller.enqueue(new TextEncoder().encode(`__CODE_CONTEXT_START__\n${encodedContext}\n__CODE_CONTEXT_END__\n\n`));

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
    console.error('Streaming error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
