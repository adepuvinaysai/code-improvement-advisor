'use client';
import { useState } from 'react';
import GithubInput from '@/components/GithubInput';
import AnalysisReport from '@/components/AnalysisReport';
import { Code2 } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const analyzeRepo = async (url) => {
    setLoading(true);
    setError('');
    setReport('');

    try {
      // Step 1: Request analysis from our backend
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze repository');
      }

      // Step 2: Handle streaming response (if backend supports it) or standard JSON
      // For simplicity, let's assume the backend returns JSON first.
      const data = await response.json();
      setReport(data.report);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Code2 size={24} color="white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Antigravity<span className="text-secondary font-medium">Advisor</span></h1>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-sm font-medium hover:text-accent-1 transition-colors">Documentation</a>
          <a href="#" className="text-sm font-medium hover:text-accent-1 transition-colors">GitHub</a>
        </div>
      </header>

      <main className="container flex-1 py-12 flex flex-col items-center">
        {!report && !error && (
          <div className="text-center mt-8 mb-4">
            <div className="badge mb-6">AI-Powered Analysis</div>
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Elevate Your <span className="text-gradient">Code Quality</span>
            </h1>
          </div>
        )}

        <GithubInput onSubmit={analyzeRepo} loading={loading} />
        
        <AnalysisReport report={report} error={error} />
      </main>

      <footer className="p-6 text-center text-sm text-secondary border-t border-white/5">
        &copy; {new Date().getFullYear()} Antigravity Advisor. Built with Next.js and AI.
      </footer>
    </>
  );
}
