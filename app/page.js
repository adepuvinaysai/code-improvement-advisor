'use client';
import { useState, useEffect } from 'react';
import { Sparkles, BarChart3, Settings, User } from 'lucide-react';
import GithubInput from '@/components/GithubInput';
import AnalysisReport from '@/components/AnalysisReport';
import FileExplorer from '@/components/FileExplorer';
import HistoryCard from '@/components/HistoryCard';
import SettingsModal from '@/components/SettingsModal';
import AgentStatus from '@/components/AgentStatus';
import RoleSelector from '@/components/RoleSelector';
import useRepoAnalysis from '@/hooks/useRepoAnalysis';
import { Github } from '@/components/BrandIcons';

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    loading,
    report,
    error,
    repoTree,
    mode,
    setMode,
    fileScores,
    codeContext,
    history,
    repoUrl,
    setRepoUrl,
    fetchTree,
    analyzeRepo,
    clearHistory,
    reset
  } = useRepoAnalysis();

  const handleSearch = (url, analysisMode) => {
    setRepoUrl(url);
    fetchTree(url);
    analyzeRepo(url, [], analysisMode);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get('repo');
    if (repoParam && !repoUrl) {
      fetchTree(repoParam);
    }
  }, []);

  return (
    <>
      <header className="w-full bg-transparent z-50">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
          <div className="flex items-center gap-5 group cursor-pointer h-12">
            <div className="w-12 h-12 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(129,140,248,0.2)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 relative">
              <img
                src="/icon.png"
                alt="Syntaq.io"
                className="absolute inset-0 w-full h-full object-cover block"
              />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-white leading-none flex items-center h-full pt-1">
              Syntaq<span className="text-indigo-400">.io</span>
            </h1>
          </div>
          <div className="flex items-center gap-10">
            <nav className="hidden md:flex items-center gap-10">
              <a href="#" className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all duration-500">Platform</a>
              <a href="#" className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all duration-500">Documentation</a>
            </nav>
            <button
              onClick={() => setSettingsOpen(true)}
              className="relative overflow-hidden group flex items-center gap-3 py-0.5 pl-0.5 pr-5 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(129,140,248,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.8) 100%)',
                boxShadow: '0 0 30px rgba(99,102,241,0.3)',
              }}
            >
              <div
                className="flex items-center gap-3 py-2 pl-3 pr-3 rounded-full"
                style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }}
              >
                <Settings size={17} className="text-white group-hover:rotate-90 transition-transform duration-700" />
                <span className="text-[12px] font-black uppercase tracking-widest text-white drop-shadow-[0_0_6px_rgba(129,140,248,0.7)]">Settings</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className={`container flex-1 py-12 flex flex-col items-center transition-opacity duration-300 ${settingsOpen ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>
        {!report && !error && !repoTree && (
          <div className="text-center mt-20 mb-12 animate-slide-up max-w-4xl">
            <div className="inline-flex items-center gap-3 mb-10 py-2 px-8 rounded-full border border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
              <Sparkles className="text-indigo-400" size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-300">Intelligent Architecture</span>
            </div>
            <h1 className="text-8xl md:text-9xl font-black mb-10 tracking-[-0.05em] leading-[0.9] text-white">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x drop-shadow-[0_0_30px_rgba(129,140,248,0.3)]">Code Intelligence.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-20 leading-relaxed font-medium tracking-tight">
              A world-class audit platform designed for the modern engineer. <br />
              <span className="text-slate-200">Quality. Security. Performance.</span> Reimagined.
            </p>
          </div>
        )}

        {!repoTree && !report && (
          <>
            <div className="flex justify-center mb-8">
              <RoleSelector currentRole={mode} onRoleChange={setMode} disabled={loading} />
            </div>
            <GithubInput onSubmit={handleSearch} loading={loading} />

            <AgentStatus mode={mode} isAnalyzing={loading} />

            {history.length > 0 && (
              <div className="w-full max-w-4xl mt-16 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent-1" />
                    Recent Scans
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="overflow-hidden group/btn"
                    style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(248,113,113,0.6),rgba(239,68,68,0.4))', borderRadius: '99px', boxShadow: '0 0 14px rgba(239,68,68,0.2)' }}
                  >
                    <div className="flex items-center gap-1.5 py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-300 group-hover/btn:text-white transition-colors" style={{ background: 'linear-gradient(135deg,#2a0a0a,#3d1010)', borderRadius: '99px' }}>
                      Clear History
                    </div>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((scan, i) => (
                    <HistoryCard key={i} scan={scan} onClick={fetchTree} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {repoTree && !loading && (
          <FileExplorer
            tree={repoTree}
            onSelectFiles={(files) => analyzeRepo(repoUrl, files, mode)}
            onCancel={reset}
            scores={fileScores}
          />
        )}

        {loading && (
          <div className="flex flex-col items-center gap-4 mt-20">
            <div className="loader w-12 h-12 border-4 border-accent-1 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-accent-1 font-medium animate-pulse">
              {repoTree ? 'Syntaq AI is analyzing your code...' : 'Fetching repository structure...'}
            </p>
          </div>
        )}

        <AnalysisReport
          report={report}
          error={error}
          repoUrl={repoUrl}
          history={history}
          codeContext={codeContext}
        />
      </main>

      <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-xl mt-20">
        <div className="container py-12 grid grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                <img src="/icon.png" alt="Syntaq.io Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-white">Syntaq<span className="text-slate-500">.io</span></h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Empowering developers with AI-driven code reviews and refactoring insights to build cleaner, faster, and more maintainable software.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Platform</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-slate-500">
              <li>
                <a href="https://github.com/adepuvinaysai/syntaq.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Github size={16} />
                  GitHub Repository
                </a>
              </li>
              <li><a href="https://github.com/adepuvinaysai/syntaq.io/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="https://github.com/adepuvinaysai/syntaq.io/blob/main/README.md#-api-reference" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Connect</h4>
            <ul className="flex flex-col gap-3 text-[13px] text-slate-500">
              <li><a href="mailto:hello@syntaq.io" className="hover:text-white transition-colors">hello@syntaq.io</a></li>

            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="container flex justify-between items-center text-xs text-secondary">
            <p>&copy; 2026 Syntaq.io. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Crafted with</span>
              <span className="text-accent-3 mx-1">♥</span>
              <span>by</span>
              <a
                href="https://linkedin.com/in/vinay-sai-adepu-23464b122"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-black ml-1 hover:text-indigo-400 transition-all flex items-center gap-1"
              >
                Vinay Sai Adepu
                <User size={12} className="opacity-50" />
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
