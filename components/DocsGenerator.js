'use client';
import { useState } from 'react';
import { FileText, X, Copy, Download, Check, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DocsGenerator({ isOpen, onClose, codeContext, repoName }) {
  const [docs, setDocs] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDocs = async () => {
    setLoading(true);
    setDocs('');
    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeContext, repoName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      setDocs(data.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(docs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([docs], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README-${repoName || 'project'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel max-w-4xl w-full h-[80vh] flex flex-col relative animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-3/20 text-accent-3">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Documentation Generator</h2>
              <p className="text-xs text-secondary">Generate professional READMEs based on your code</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-0.5 rounded-full overflow-hidden group"
            style={{ background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}
          >
            <div className="p-1.5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
              <X size={16} className="text-white group-hover:rotate-90 transition-all duration-500" />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {!docs && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <FileText size={48} className="text-white/20 mb-4" />
              <h3 className="text-lg font-bold mb-2">Ready to Document?</h3>
              <p className="text-sm text-secondary mb-6">
                Our AI will analyze your provided code files and generate a comprehensive README.md file in seconds.
              </p>
              <button 
                onClick={generateDocs}
                className="overflow-hidden group/btn"
                style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '16px', boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.4)', display: 'inline-flex' }}
              >
                <div className="relative flex items-center gap-3 py-4 px-10 font-black uppercase tracking-[0.3em] text-white text-[13px] transition-all" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)', borderRadius: '15px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)' }}>
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <BookOpen size={18} className="text-indigo-200" />
                  <span className="drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]">Generate Documentation</span>
                </div>
              </button>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 border-4 border-accent-3 border-t-transparent rounded-full animate-spin" />
              <p className="text-accent-3 font-medium animate-pulse">Analyzing architecture and writing docs...</p>
            </div>
          )}

          {docs && (
            <div className="animate-fade-in">
              <div className="flex justify-end gap-2 mb-4 sticky top-0 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/5 z-10">
                <button onClick={handleCopy}
                  className="overflow-hidden group/btn"
                  style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '12px', boxShadow: '0 0 20px rgba(99,102,241,0.35)', display: 'inline-flex' }}
                >
                  <div className="flex items-center gap-2 py-2 px-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)', borderRadius: '11px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    {copied ? <Check size={13} className="text-indigo-200" /> : <Copy size={13} className="text-indigo-200" />}
                    <span className="drop-shadow-[0_0_6px_rgba(129,140,248,0.7)]">{copied ? 'Copied' : 'Copy MD'}</span>
                  </div>
                </button>
                <button onClick={handleDownload}
                  className="overflow-hidden group/btn"
                  style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '12px', boxShadow: '0 0 20px rgba(99,102,241,0.35)', display: 'inline-flex' }}
                >
                  <div className="flex items-center gap-2 py-2 px-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)', borderRadius: '11px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    <Download size={13} className="text-indigo-200" />
                    <span className="drop-shadow-[0_0_6px_rgba(129,140,248,0.7)]">Download</span>
                  </div>
                </button>
              </div>
              <div className="markdown-body bg-white/5 p-8 rounded-2xl border border-white/5">
                <ReactMarkdown>{docs}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
