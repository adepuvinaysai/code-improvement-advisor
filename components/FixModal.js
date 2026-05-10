'use client';
import { X, Copy, Check, Wand2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function FixModal({ isOpen, onClose, issue, originalCode, refactoredCode, onApply, loading }) {
  const [editedCode, setEditedCode] = useState(refactoredCode);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const response = await fetch('/api/refactor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, originalCode, newCode: editedCode }),
      });
      const data = await response.json();
      setVerificationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay animate-in fade-in duration-300">
      <div className="glass-panel modal-content p-0 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-1/20 text-accent-1">
              <Wand2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Refactor Proposal</h3>
              <p className="text-xs text-secondary">Resolving: {issueTitle}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-0.5 rounded-full overflow-hidden group"
            style={{ background: 'linear-gradient(135deg,rgba(255,80,80,0.4),rgba(200,50,50,0.2))', boxShadow: '0 0 10px rgba(255,80,80,0.15)' }}
          >
            <div className="p-1.5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1a0a0a,#2a1010)' }}>
              <X size={16} className="text-red-300 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
            </div>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-6">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="loader w-12 h-12 border-4 border-accent-1 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-accent-1 font-medium animate-pulse">Consulting Syntaq AI...</p>
            </div>
          ) : (
            <>
              <div className="diff-grid flex-1 overflow-hidden">
                <div className="diff-pane">
                  <div className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Original Code
                  </div>
                  <pre className="code-window custom-scrollbar">
                    <code>{originalCode}</code>
                  </pre>
                </div>
                <div className="diff-pane">
                  <div className="text-xs font-bold uppercase tracking-widest text-accent-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Syntaq Optimized
                  </div>
                  <pre className="code-window custom-scrollbar border-accent-1/30">
                    <code>{refactoredCode}</code>
                  </pre>
                </div>
              </div>

              {verificationResult && (
                <div className={`p-4 rounded-xl flex items-start gap-3 animate-slide-up ${verificationResult.verified ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                  {verificationResult.verified ? (
                    <ShieldCheck size={20} className="text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-bold ${verificationResult.verified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {verificationResult.verified ? 'Verified Solution' : 'Verification Failed'}
                    </p>
                    <p className="text-xs text-secondary mt-1">{verificationResult.comment}</p>
                    {verificationResult.verified && (
                      <button 
                        onClick={onApply}
                        className="mt-3 overflow-hidden group/btn"
                        style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(52,211,153,0.8),rgba(16,185,129,0.6))', borderRadius: '12px', boxShadow: '0 0 18px rgba(52,211,153,0.3)', display: 'inline-flex' }}
                      >
                        <div className="flex items-center gap-2 py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200 group-hover/btn:text-white transition-colors" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)', borderRadius: '11px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                          <Check size={12} className="text-emerald-300" />
                          Apply & Mark as Resolved
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                {/* Cancel */}
                <button onClick={onClose}
                  className="overflow-hidden group/btn"
                  style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '14px', boxShadow: '0 0 20px rgba(99,102,241,0.3)', display: 'inline-flex' }}
                >
                  <div className="flex items-center gap-2 py-2.5 px-6 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#1e1b4b)', borderRadius: '13px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    Cancel
                  </div>
                </button>
                {/* Verify Fix */}
                <button onClick={handleVerify} disabled={verifying}
                  className="overflow-hidden group/btn disabled:opacity-40 disabled:pointer-events-none"
                  style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '14px', boxShadow: '0 0 24px rgba(99,102,241,0.35)', display: 'inline-flex' }}
                >
                  <div className="flex items-center gap-2 py-2.5 px-6 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#1e1b4b)', borderRadius: '13px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    {verifying ? <Loader2 size={14} className="animate-spin text-indigo-200" /> : <ShieldCheck size={14} className="text-indigo-200" />}
                    <span className="drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]">{verifying ? 'Verifying…' : 'Verify Fix'}</span>
                  </div>
                </button>
                {/* Copy Fix */}
                <button onClick={handleCopy}
                  className="overflow-hidden group/btn"
                  style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '14px', boxShadow: '0 0 24px rgba(99,102,241,0.35)', display: 'inline-flex' }}
                >
                  <div className="relative flex items-center gap-2 py-2.5 px-6 text-xs font-black uppercase tracking-[0.2em] text-white transition-all" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#1e1b4b)', borderRadius: '13px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                    <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    {copied ? <Check size={14} className="text-indigo-200" /> : <Copy size={14} className="text-indigo-200" />}
                    <span className="drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]">{copied ? 'Copied!' : 'Copy Fix'}</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
