'use client';
import { useState } from 'react';
import { Loader2, Sparkles, Search } from 'lucide-react';



export default function GithubInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('standard');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), mode);
    }
  };

  const handleSuggestionClick = (suggestionUrl) => {
    setUrl(suggestionUrl);
    onSubmit(suggestionUrl, mode);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 mt-12 animate-slide-up relative z-10 px-6 md:px-0">
      
      {/* Integrated Search Engine */}
      <div className="w-full bg-white/10 backdrop-blur-2xl rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center gap-4 group transition-all duration-700 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.03)] focus-within:border-white/30 focus-within:bg-white/15">
        
        <div className="md:pl-6 flex items-center justify-center text-white/40 group-focus-within:text-white/80 transition-colors duration-500">
          <Search size={22} />
        </div>

        <div className="hidden md:block w-px h-8 bg-white/10 flex-shrink-0" />

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ENTER REPOSITORY URL..."
            className="flex-1 bg-transparent border-none py-4 px-4 outline-none text-xl text-white placeholder:text-slate-400 font-mono tracking-[0.1em] min-w-0"
            disabled={loading}
            required
            pattern="https:\/\/github\.com\/.*"
          />

          <button 
            type="submit" 
            disabled={loading || !url.trim()}
            className="relative w-full md:w-auto overflow-hidden rounded-2xl disabled:opacity-30 disabled:grayscale disabled:pointer-events-none group/btn"
            style={{
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(129,140,248,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.8) 100%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Inner button surface */}
            <div
              className="relative flex items-center justify-center gap-3 whitespace-nowrap rounded-2xl px-12 py-5 transition-all duration-500 group-hover/btn:-translate-y-0.5 group-active/btn:translate-y-0"
              style={{
                background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)',
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                  animation: 'shimmer 1.8s infinite',
                }}
              />
              {/* Top gloss */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 text-indigo-300" />
                  <span className="text-[13px] font-black uppercase tracking-[0.3em] text-indigo-200">Scanning…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-indigo-200 group-hover/btn:text-white transition-colors duration-300 group-hover/btn:rotate-12 transition-transform" />
                  <span className="text-[13px] font-black uppercase tracking-[0.3em] text-white drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]">Execute Analysis</span>
                </>
              )}
            </div>
          </button>
        </form>
        </div>
      
      {/* Quick Ecosystems */}
      <div className="flex flex-wrap justify-center gap-6 animate-fade-in delay-700">
        {[
          { label: 'Next.js Commerce', url: 'https://github.com/vercel/commerce' },
          { label: 'Tailwind CSS', url: 'https://github.com/tailwindlabs/tailwindcss' },
          { label: 'React Query', url: 'https://github.com/TanStack/query' }
        ].map((repo, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionClick(repo.url)}
            className="px-8 py-3 rounded-full bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-400 hover:bg-white/5 hover:border-indigo-500/20 transition-all duration-500"
          >
            {repo.label}
          </button>
        ))}
      </div>
    </div>
  );
}
