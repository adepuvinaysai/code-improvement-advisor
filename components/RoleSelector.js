'use client';
import { Shield, Sparkles, Layout, Code2, ChevronDown, Box, Zap, Cpu } from 'lucide-react';
import { useState } from 'react';

const ROLES = [
  { id: 'standard', name: 'Standard Auditor', icon: Box, color: 'text-[#818cf8]', glow: 'rgba(236, 238, 216, 0.4)', bg: 'from-[#818cf8]/20', desc: 'Balanced audit of quality, security, and performance.' },
  { id: 'sentinel', name: 'Sentinel Security', icon: Shield, color: 'text-[#c084fc]', glow: 'rgba(192, 132, 252, 0.4)', bg: 'from-[#c084fc]/20', desc: 'Deep-dive into OWASP vulnerabilities and data safety.' },
  { id: 'optimizer', name: 'Runtime Optimizer', icon: Zap, color: 'text-[#fbbf24]', glow: 'rgba(251, 191, 36, 0.4)', bg: 'from-[#fbbf24]/20', desc: 'Focus on complexity, memory leaks, and speed.' },
  { id: 'mentor', name: 'Dev Mentor', icon: Cpu, color: 'text-[#34d399]', glow: 'rgba(52, 211, 153, 0.4)', bg: 'from-[#34d399]/20', desc: 'Clear explanations, best practices, and readability.' },
];

export default function RoleSelector({ currentRole, onRoleChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeRole = ROLES.find(r => r.id === currentRole) || ROLES[0];

  return (
    <div className="relative w-full max-w-2xl group/dropdown mx-auto">
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full overflow-hidden flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(129,140,248,0.8) 0%, rgba(168,85,247,0.6) 50%, rgba(99,102,241,0.8) 100%)',
          boxShadow: isOpen
            ? '0 0 80px rgba(99,102,241,0.45), 0 8px 32px rgba(0,0,0,0.5)'
            : '0 0 40px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top gloss */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-10 rounded-t-full" />
        <div
          className="w-full flex items-center justify-between px-8 py-5 rounded-full"
          style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.3)' }}
        >
          <div className="flex items-center gap-5">
            <div className="p-3.5 rounded-full bg-white/10 text-white group-hover/dropdown:scale-110 transition-all duration-500 shadow-[0_0_20px_rgba(129,140,248,0.2)] flex-shrink-0">
              <activeRole.icon size={26} />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-black tracking-[0.5em] mb-0.5 text-white">Target Engine</p>
              <p className="text-xl font-black text-white tracking-tight leading-tight drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]">{activeRole.name}</p>
              <p className="text-[11px] text-white font-medium mt-0.5 leading-snug">{activeRole.desc}</p>
            </div>
          </div>
          <ChevronDown size={24} className={`text-indigo-300 flex-shrink-0 transition-all duration-700 ${isOpen ? 'rotate-180 text-white' : 'group-hover/dropdown:text-white'}`} />
        </div>
      </button>


      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+16px)] left-0 w-full glass-panel p-2 z-50 animate-slide-up shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden rounded-[2.5rem]">
          {ROLES.map((role) => (
            <div
              key={role.id}
              onClick={() => {
                onRoleChange(role.id);
                setIsOpen(false);
              }}
              className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-500 flex items-center gap-5 relative overflow-hidden group/item mb-1 last:mb-0 ${currentRole === role.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            >
              <div className={`p-3 rounded-full bg-white/10 ${role.color} transition-all duration-500 group-hover/item:bg-white/20 group-hover/item:scale-110 group-hover/item:shadow-[0_0_20px_currentColor]`}>
                <role.icon size={22} />
              </div>
              <div>
                <p className={`text-lg font-black tracking-wide transition-colors ${currentRole === role.id ? 'text-white' : 'text-white/90 group-hover/item:text-white'}`}>{role.name}</p>
                <p className="text-xs leading-tight mt-1 transition-colors font-medium text-white/80 group-hover/item:text-white">{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
