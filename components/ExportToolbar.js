'use client';
import { FileDown, Share2, Check, BookOpen } from 'lucide-react';
import { Github } from '@/components/BrandIcons';
import { useState } from 'react';

export default function ExportToolbar({ repoUrl, onGenerateDocs }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('repo', repoUrl);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const premiumBtn = (color, shadow) => ({
    padding: '1px',
    background: color,
    boxShadow: shadow,
    borderRadius: '14px',
    display: 'inline-flex',
  });
  const innerBtn = (bg) => ({
    background: bg,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.3)',
    borderRadius: '13px',
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px',
  });

  return (
    <div className="flex items-center gap-3 no-print flex-wrap">
      {/* Download PDF */}
      <button onClick={handlePrint} className="overflow-hidden group/btn" style={premiumBtn('linear-gradient(135deg,rgba(129,140,248,0.7),rgba(99,102,241,0.5))','0 0 18px rgba(99,102,241,0.3)')}>
        <div style={innerBtn('linear-gradient(135deg,#1e1b4b,#2d2b6e)')}>
          <FileDown size={13} className="text-indigo-300 group-hover/btn:text-white transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 group-hover/btn:text-white transition-colors">PDF</span>
        </div>
      </button>
      {/* Generate Docs */}
      <button onClick={onGenerateDocs} className="overflow-hidden group/btn" style={premiumBtn('linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))','0 0 20px rgba(99,102,241,0.35)')}>
        <div style={innerBtn('linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)')}>
          <BookOpen size={13} className="text-indigo-200 group-hover/btn:text-white transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_6px_rgba(129,140,248,0.7)] group-hover/btn:drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">Docs</span>
        </div>
      </button>
      {/* Share Report */}
      <button onClick={handleShare} className="overflow-hidden group/btn" style={premiumBtn('linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))','0 0 20px rgba(99,102,241,0.35)')}>
        <div style={innerBtn('linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)')}>
          {copied ? <Check size={13} className="text-indigo-200" /> : <Share2 size={13} className="text-indigo-200 group-hover/btn:text-white transition-colors" />}
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_6px_rgba(129,140,248,0.7)]">{copied ? 'Copied!' : 'Share'}</span>
        </div>
      </button>
      {/* Source Code */}
      <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="overflow-hidden group/btn" style={premiumBtn('linear-gradient(135deg,rgba(129,140,248,0.5),rgba(99,102,241,0.3))','0 0 14px rgba(99,102,241,0.2)')}>
        <div style={innerBtn('linear-gradient(160deg,#1e1b4b,#312e81 40%,#1e1b4b)')}>
          <Github size={13} className="text-indigo-300 group-hover/btn:text-white transition-colors" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 group-hover/btn:text-white transition-colors">Source</span>
        </div>
      </a>
    </div>
  );
}
