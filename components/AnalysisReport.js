'use client';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, CheckCircle, FileCode2, Sparkles, TrendingUp } from 'lucide-react';

export default function AnalysisReport({ report, error }) {
  if (error) {
    return (
      <div className="glass-panel p-6 mt-8 max-w-4xl mx-auto border-red-500/30">
        <div className="flex items-center gap-3 text-red-400 mb-2">
          <AlertCircle size={24} />
          <h3 className="text-xl font-bold">Analysis Failed</h3>
        </div>
        <p className="text-secondary">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mt-12 max-w-4xl w-full mx-auto flex flex-col gap-6 mb-20">
      
      <div className="flex items-center gap-3 justify-center mb-4">
        <Sparkles className="text-accent-2" size={32} />
        <h2 className="text-4xl text-gradient">AI Analysis Report</h2>
      </div>

      <div className="glass-panel p-8">
        <div className="markdown-body">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
