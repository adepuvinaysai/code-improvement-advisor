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
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syntaq_history') || localStorage.getItem(HISTORY_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return []; }
      }
    }
    return [];
  });

  const saveToHistory = (url, reportContent) => {
    let score = null;
    try {
      const jsonMatch = reportContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        score = data.metrics.overallScore;
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

      // Read Code Context from header
      const encodedCode = response.headers.get('X-Code-Context');
      if (encodedCode) {
        setCodeContext(atob(encodedCode));
      }

      // Handle Streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReport = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullReport += chunk;
        setReport(fullReport); // Incremental update
      }

      // Extract file scores for heatmap
      try {
        const jsonMatch = fullReport.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          if (data.fileScores) setFileScores(data.fileScores);
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
