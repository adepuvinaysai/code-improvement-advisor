'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function QualityTrend({ history, currentRepoUrl }) {
  const repoHistory = history
    .filter(item => item.url === currentRepoUrl && item.score !== undefined)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (repoHistory.length < 2) return null;

  const scores = repoHistory.map(h => h.score);
  const maxScore = 100;
  const minScore = 0;
  
  const width = 300;
  const height = 60;
  const padding = 5;

  const points = scores.map((score, i) => {
    const x = padding + (i * (width - 2 * padding)) / (scores.length - 1);
    const y = height - padding - (score * (height - 2 * padding)) / 100;
    return `${x},${y}`;
  }).join(' ');

  const lastScore = scores[scores.length - 1];
  const prevScore = scores[scores.length - 2];
  const delta = lastScore - prevScore;

  return (
    <div className="glass-panel p-4 flex items-center gap-6 animate-slide-up">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-secondary">Quality Trend</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{lastScore}%</span>
          <div className={`flex items-center text-xs font-bold ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-secondary'}`}>
            {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            {delta !== 0 && Math.abs(delta) + '%'}
          </div>
        </div>
      </div>

      <div className="flex-1 h-[60px] relative">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area under the line */}
          <polyline
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#trendGradient)"
            style={{ clipPath: 'inset(0 0 0 0)' }}
          />
          
          {/* Main line */}
          <polyline
            fill="none"
            stroke="var(--accent-1)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-[0_0_8px_rgba(var(--accent-1-rgb),0.5)]"
          />
          
          {/* Points */}
          {repoHistory.map((h, i) => {
            const [x, y] = points.split(' ')[i].split(',');
            return (
              <circle 
                key={i} 
                cx={x} cy={y} r="3" 
                fill="white" 
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <title>{new Date(h.timestamp).toLocaleDateString()}: {h.score}%</title>
              </circle>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
