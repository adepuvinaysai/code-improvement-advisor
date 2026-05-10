'use client';
import { Shield, Sparkles, Layout, Loader2, CheckCircle2 } from 'lucide-react';

export default function AgentStatus({ mode, isAnalyzing }) {
  if (mode !== 'deep' || !isAnalyzing) return null;

  const agents = [
    { name: 'Security Auditor', icon: Shield, color: 'text-indigo-400' },
    { name: 'Performance Guru', icon: Sparkles, color: 'text-purple-400' },
    { name: 'Software Architect', icon: Layout, color: 'text-pink-400' },
  ];

  return (
    <div className="mt-12 animate-fade-in max-w-4xl w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Multimodal Agent Consensus in Progress</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={i} className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group">
            <div className={`p-3.5 rounded-xl bg-white/5 ${agent.color} shadow-inner`}>
              <agent.icon size={22} />
            </div>
            <div>
              <p className="text-[12px] font-black text-white tracking-wide mb-1 uppercase">{agent.name}</p>
              <div className="flex items-center gap-2.5">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cross-referencing context...</span>
              </div>
            </div>
            {/* Animated precision beam */}
            <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-full animate-shimmer opacity-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
