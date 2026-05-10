import { NextResponse } from 'next/server';

function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
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
    const clientToken = req.headers.get('X-GitHub-Token');
    const githubToken = clientToken || process.env.GITHUB_TOKEN;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Syntaq-io'
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Try main then master
    let branch = 'main';
    let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    let treeResponse = await fetch(treeUrl, { headers });

    if (!treeResponse.ok) {
      branch = 'master';
      treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      treeResponse = await fetch(treeUrl, { headers });
      
      if (!treeResponse.ok) {
        if (treeResponse.status === 403 || treeResponse.status === 429) {
          return NextResponse.json({ error: 'GitHub rate limit exceeded.' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch repo structure.' }, { status: 404 });
      }
    }

    const treeData = await treeResponse.json();
    
    // Filter out junk
    const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java', '.cpp', '.c', '.h', '.css', '.html'];
    const filteredTree = treeData.tree.filter(item => {
      if (item.type === 'tree') return true; // Keep folders
      return validExtensions.some(ext => item.path.endsWith(ext)) &&
             !item.path.includes('node_modules') &&
             !item.path.includes('.git') &&
             !item.path.includes('dist/') &&
             !item.path.includes('build/');
    });

    return NextResponse.json({ 
      tree: filteredTree, 
      owner, 
      repo, 
      branch 
    });

  } catch (err) {
    console.error('Tree fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
