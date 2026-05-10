'use client';
import { GitBranch, Clock, ChevronRight, BarChart3 } from 'lucide-react';

export default function HistoryCard({ scan, onClick }) {
  const date = new Date(scan.timestamp);
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-accent-1';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div 
      onClick={() => onClick(scan.url)}
      className="glass-panel p-4 flex items-center justify-between cursor-pointer group hover:border-accent-1/50 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white/5 text-secondary group-hover:text-white transition-colors">
          <GitBranch size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm truncate max-w-[150px]">{scan.repoName}</h4>
          <div className="flex items-center gap-2 text-[10px] text-secondary">
            <Clock size={10} />
            <span>{timeAgo(date)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className={`text-lg font-bold ${getScoreColor(scan.score)}`}>
            {scan.score}%
          </div>
          <div className="text-[10px] text-secondary uppercase tracking-widest font-bold">Score</div>
        </div>
        <div className="p-2 rounded-full bg-white/5 text-secondary group-hover:translate-x-1 transition-transform">
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}
