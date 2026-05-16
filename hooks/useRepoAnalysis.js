'use client';
import { useState, useEffect } from 'react';

const HISTORY_KEY = 'syntaq_scan_history';

export default function useRepoAnalysis() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoTree, setRepoTree] = useState(null);
  const [mode, setMode] = useState('standard');
  const [fileScores, setFileScores] = useState({});
  const [codeContext, setCodeContext] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syntaq_history') || localStorage.getItem(HISTORY_KEY);
      if (saved) {
        try { 
          setHistory(JSON.parse(saved)); 
        } catch (e) {}
      }
    }
  }, []);

  const saveToHistory = (url, reportContent) => {
    let score = null;
    try {
      const matches = [...reportContent.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
      if (matches.length > 0) {
        for (let i = matches.length - 1; i >= 0; i--) {
          try {
            const data = JSON.parse(matches[i][1]);
            if (data && data.metrics) {
              score = data.metrics.overallScore;
              break;
            }
          } catch (err) {}
        }
      }
    } catch (e) {}

    const newEntry = {
      url,
      repoName: url.split('/').pop(),
      score,
      timestamp: new Date().toISOString(),
      report: reportContent
    };

    const updatedHistory = [newEntry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const fetchTree = async (url) => {
    setLoading(true);
    setError('');
    setRepoUrl(url);
    const token = localStorage.getItem('github_token');

    try {
      const response = await fetch('/api/repo/tree', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-GitHub-Token': token || ''
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch tree');
      setRepoTree(data.tree);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepo = async (url, selectedFiles = [], analysisMode = 'standard') => {
    setLoading(true);
    setError('');
    setReport('');
    setMode(analysisMode);
    
    try {
      const settings = JSON.parse(localStorage.getItem('syntaq_settings') || '{}');
      const endpoint = analysisMode === 'deep' ? '/api/analyze/multi-agent' : '/api/analyze';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-GitHub-Token': settings.githubToken || ''
        },
        body: JSON.stringify({ url, files: selectedFiles }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed');
      }

      // Handle Streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReport = '';
      let extractedContext = false;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        if (!extractedContext) {
          const endMarker = '__CODE_CONTEXT_END__\n\n';
          const endIdx = buffer.indexOf(endMarker);
          if (endIdx !== -1) {
            const startMarker = '__CODE_CONTEXT_START__\n';
            const startIdx = buffer.indexOf(startMarker);
            if (startIdx !== -1) {
              const codeBase64 = buffer.substring(startIdx + startMarker.length, endIdx);
              try { setCodeContext(atob(codeBase64)); } catch (e) {}
            }
            extractedContext = true;
            fullReport += buffer.substring(endIdx + endMarker.length);
            setReport(fullReport);
          }
        } else {
          fullReport += chunk;
          setReport(fullReport);
        }
      }

      // Extract file scores for heatmap
      try {
        const matches = [...fullReport.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
        if (matches.length > 0) {
          for (let i = matches.length - 1; i >= 0; i--) {
            try {
              const data = JSON.parse(matches[i][1]);
              if (data && data.fileScores) {
                setFileScores(data.fileScores);
                break;
              }
            } catch (err) {}
          }
        }
      } catch (e) {
        console.error('Failed to parse file scores:', e);
      }

      saveToHistory(url, fullReport);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const reset = () => {
    setReport('');
    setError('');
    setRepoTree(null);
  };

  return {
    loading,
    report,
    error,
    repoUrl,
    setRepoUrl,
    repoTree,
    mode,
    setMode,
    fileScores,
    codeContext,
    history,
    fetchTree,
    analyzeRepo,
    clearHistory,
    reset
  };
}
