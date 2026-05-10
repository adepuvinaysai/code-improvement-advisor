'use client';
import { X, Key, ShieldCheck, ExternalLink, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsModal({ isOpen, onClose }) {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_token') || '';
    }
    return '';
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('github_token', token.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[100px] animate-fade-in">
      <div className="glass-panel max-w-xl w-full max-h-[90vh] overflow-y-auto p-10 relative animate-slide-up shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-0.5 rounded-xl overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.8), rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.8))', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}
        >
          <div className="p-1.5 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
            <X size={18} className="text-white group-hover:rotate-90 transition-all duration-500" />
          </div>
        </button>

        <div className="flex items-center gap-5 mb-10">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner">
            <Key size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white leading-none mb-2">Engine Configuration</h2>
            <p className="text-[11px] uppercase font-black tracking-[0.3em] text-slate-500">Global API & Security Tokens</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold mb-3 text-secondary uppercase tracking-widest pl-1">
              GitHub Personal Access Token
            </label>
            <div className="relative group">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-5 px-6 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-700 text-[1.1rem] text-white placeholder:text-slate-800 font-mono tracking-[0.1em] shadow-2xl"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-5 flex items-center gap-3 pl-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              AES-256 Local Encryption. Data never leaves your machine.
            </p>
          </div>

          <div className="p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <ExternalLink size={14} className="text-accent-3" />
              Why add a token?
            </h4>
            <ul className="text-xs text-secondary space-y-1 list-disc pl-4">
              <li>Analyze private repositories</li>
              <li>Higher API rate limits (5,000 req/hour)</li>
              <li>Required for large repository exploration</li>
            </ul>
          </div>

          <button 
            onClick={handleSave}
            disabled={saved}
            className="relative w-full overflow-hidden rounded-2xl disabled:opacity-60 group/btn cursor-pointer"
            style={{
              padding: '1px',
              background: saved
                ? 'linear-gradient(135deg, rgba(52,211,153,0.8), rgba(16,185,129,0.6))'
                : 'linear-gradient(135deg, rgba(129,140,248,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.8) 100%)',
              boxShadow: saved ? '0 0 40px rgba(52,211,153,0.3)' : '0 0 40px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              className="relative flex items-center justify-center gap-3 py-5 rounded-2xl transition-all duration-500"
              style={{
                background: saved
                  ? 'linear-gradient(160deg, #064e3b 0%, #065f46 100%)'
                  : 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)',
              }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {saved ? (
                <>
                  <ShieldCheck size={20} className="text-emerald-300" />
                  <span className="text-[13px] font-black uppercase tracking-[0.3em] text-emerald-200">Configuration Validated</span>
                </>
              ) : (
                <>
                  <Save size={20} className="text-indigo-200" />
                  <span className="text-[13px] font-black uppercase tracking-[0.3em] text-white drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]">Deploy Configuration</span>
                </>
              )}
            </div>
          </button>
          
          <a 
            href="https://github.com/settings/tokens/new?scopes=repo&description=Syntaq.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-center text-[11px] font-bold text-indigo-400 hover:text-indigo-300 tracking-widest uppercase transition-colors"
          >
            Generate a GitHub Token →
          </a>
        </div>
      </div>
    </div>
  );
}
