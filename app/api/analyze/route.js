import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple helper to parse GitHub URL
function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  // Remove .git if present
  const repo = match[2].replace(/\.git$/, '');
  return { owner: match[1], repo };
}

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const repoInfo = parseGithubUrl(url);
    if (!repoInfo) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const { owner, repo } = repoInfo;
    const githubToken = process.env.GITHUB_TOKEN;

    // 1. Fetch Repo Info & Tree (simplified: just getting root files for demo)
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Code-Improvement-Advisor'
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    let branch = 'main';
    let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    let treeResponse = await fetch(treeUrl, { headers });
    
    if (!treeResponse.ok) {
      branch = 'master';
      treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      treeResponse = await fetch(treeUrl, { headers });
      
      if (!treeResponse.ok) {
        // If it's still failing, check if it's a rate limit
        if (treeResponse.status === 403 || treeResponse.status === 429) {
          return NextResponse.json({ error: 'GitHub API rate limit exceeded. Please add a GitHub Personal Access Token to .env.local.' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch repository tree. It might be private or empty.' }, { status: 404 });
      }
    }

    const treeData = await treeResponse.json();

    if (!treeData || !treeData.tree) {
       return NextResponse.json({ error: 'Invalid repository tree data received from GitHub.' }, { status: 500 });
    }

    // Filter to get some source files
    const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.cpp'];
    const files = treeData.tree.filter(item => 
      item.type === 'blob' && 
      validExtensions.some(ext => item.path.endsWith(ext)) &&
      !item.path.includes('node_modules') &&
      !item.path.includes('dist') &&
      !item.path.includes('build')
    ).slice(0, 3); // LIMIT TO 3 FILES FOR DEMO PURPOSES AND CONTEXT LIMITS

    if (files.length === 0) {
      return NextResponse.json({ error: 'No supported source files found in the repository.' }, { status: 404 });
    }

    // 2. Fetch file contents
    let combinedCode = `Repository: ${owner}/${repo}\n\n`;
    
    for (const file of files) {
      const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
      const fileRes = await fetch(fileUrl);
      if (fileRes.ok) {
        const content = await fileRes.text();
        combinedCode += `--- File: ${file.path} ---\n\`\`\`\n${content}\n\`\`\`\n\n`;
      }
    }

    // 3. Analyze with AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response if no API key is provided
      return NextResponse.json({ 
        report: `# Code Analysis (Mocked)
> **Note**: This is a mock response because \`GEMINI_API_KEY\` is not configured in the environment.

We analyzed the repository **${owner}/${repo}** and looked at ${files.length} file(s).

## General Observations
The code structure appears standard. However, to get a real AI-driven analysis of readability, performance, and best practices, please set your Gemini API key.

## Recommended Refactoring
* **Modularity**: Consider breaking down large files.
* **Typing**: Add more type definitions to improve maintainability.
`
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
You are an expert Principal Software Engineer. I am providing you with the source code of a few key files from a GitHub repository.

Please provide a highly structured, professional, and beautiful code improvement report focused on:
1. Readability and Maintainability
2. Performance optimizations
3. Best practices and modern conventions
4. Potential bugs or security issues

Use markdown formatting extensively (headers, bullet points, code blocks for diffs).
Make the report engaging. Do not just list problems; provide concrete examples of how to fix them.

Here is the code:
${combinedCode}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ report: text });

  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: `Internal server error during analysis: ${err.message}` }, { status: 500 });
  }
}
