'use client';
import ReactMarkdown from 'react-markdown';
import { 
  AlertCircle, CheckCircle2, Shield, Sparkles, BookOpen, Activity, 
  AlertTriangle, Info, MessageSquare, Check, Code2, Layout 
} from 'lucide-react';
import { useState } from 'react';
import FixModal from './FixModal';
import ExportToolbar from './ExportToolbar';
import ReportChat from './ReportChat';
import QualityTrend from './QualityTrend';
import DocsGenerator from './DocsGenerator';

const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-panel metric-card">
    <div className={`p-3 rounded-full bg-white/5 ${colorClass} mb-2`}>
      <Icon size={24} />
    </div>
    <span className="text-sm font-medium text-secondary">{title}</span>
    <div className="metric-value text-gradient">{value}%</div>
    <div className="progress-container">
      <div className="progress-fill" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const GateStatus = ({ label, status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'passed': return <CheckCircle2 size={18} className="status-passed" />;
      case 'warning': return <AlertTriangle size={18} className="status-warning" />;
      case 'failed': return <AlertCircle size={18} className="status-failed" />;
      default: return <Info size={18} className="status-not_measured" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'passed': return 'Passed';
      case 'warning': return 'Warning';
      case 'failed': return 'Failed';
      default: return 'Not Measured';
    }
  };

  return (
    <div className="gate-status">
      <span className="text-sm font-medium text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase ${`status-${status}`}`}>{getStatusText()}</span>
        {getStatusIcon()}
      </div>
    </div>
  );
};

const PERSONA_MAP = {
  sentinel: { label: 'Sentinel Security', icon: Shield, color: 'text-rose-400' },
  optimizer: { label: 'Runtime Optimizer', icon: Sparkles, color: 'text-amber-400' },
  mentor: { label: 'Dev Mentor', icon: Code2, color: 'text-emerald-400' },
  standard: { label: 'Architect', icon: Layout, color: 'text-blue-400' },
};

export default function AnalysisReport({ report, error, repoUrl, history = [], mode = 'standard', codeContext }) {
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState('');
  const [resolvedIssues, setResolvedIssues] = useState(new Set());
  const [selectedCode, setSelectedCode] = useState('');
  const [currentIssue, setCurrentIssue] = useState('');
  const [refactoredCode, setRefactoredCode] = useState('');
  const [fixLoading, setFixLoading] = useState(false);

  if (error) {
    return (
      <div className="glass-panel p-10 mt-12 max-w-4xl mx-auto border-red-500/50 bg-[#7f1d1d]/10 backdrop-blur-3xl animate-slide-up shadow-[0_0_100px_rgba(239,68,68,0.15)]">
        <div className="flex items-center gap-5 text-red-400 mb-6">
          <div className="p-4 rounded-2xl bg-red-500/10 shadow-inner">
            <AlertCircle size={40} />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tight text-white leading-none mb-2">Protocol Failure</h3>
            <p className="text-[11px] uppercase font-black tracking-[0.3em] text-red-400/60">Analysis Engine Offline</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-sm text-red-200/80 leading-relaxed">
          {error}
        </div>
      </div>
    );
  }

  if (!report) return null;

  const handleRefactor = async (code, issue) => {
    setFixModalOpen(true);
    setFixLoading(true);
    setSelectedCode(code);
    setCurrentIssue(issue || "Code Optimization");
    setRefactoredCode('');

    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeSnippet: code, issueDescription: issue }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRefactoredCode(data.refactoredCode);
    } catch (e) {
      console.error('Refactor error:', e);
    } finally {
      setFixLoading(false);
    }
  };

  // Attempt to parse JSON data block
  let dashboardData = null;
  let markdownContent = report;

  try {
    const jsonMatch = report.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1].trim().endsWith('}')) {
      dashboardData = JSON.parse(jsonMatch[1]);
      // Remove the JSON block from the displayed markdown
      markdownContent = report.replace(jsonMatch[0], '');
    }
  } catch (e) {
    console.error('Failed to parse dashboard data:', e);
  }

  return (
    <div className="mt-12 max-w-5xl w-full mx-auto flex flex-col gap-8 mb-20">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${PERSONA_MAP[mode]?.color || 'text-accent-1'}`}>
              {(() => {
                const Icon = PERSONA_MAP[mode]?.icon || Activity;
                return <Icon size={32} />;
              })()}
            </div>
            <div className="flex flex-col items-start gap-1">
              <div className="badge">{PERSONA_MAP[mode]?.label || 'Standard'} Audit</div>
              <h2 className="text-4xl text-gradient">{repoUrl.split('/').pop()} Quality</h2>
            </div>
          </div>
        <ExportToolbar repoUrl={repoUrl} onGenerateDocs={() => setDocsOpen(true)} />
      </div>

      <DocsGenerator 
        isOpen={docsOpen} 
        onClose={() => setDocsOpen(false)} 
        codeContext={codeContext}
        repoName={repoUrl.split('/').pop()}
      />

      {dashboardData && (
        <div className="flex flex-col gap-6">
          <QualityTrend history={history} currentRepoUrl={repoUrl} />

          <div className="dashboard-grid">
            <MetricCard 
              title="Overall Quality" 
              value={dashboardData.metrics.overallScore} 
              icon={Activity} 
              colorClass="text-accent-1"
            />
            <MetricCard 
              title="Security" 
              value={dashboardData.metrics.securityScore} 
              icon={Shield} 
              colorClass="text-accent-3"
            />
            <MetricCard 
              title="Maintainability" 
              value={dashboardData.metrics.maintainabilityScore} 
              icon={BookOpen} 
              colorClass="text-accent-2"
            />
            <MetricCard 
              title="Performance" 
              value={dashboardData.metrics.performanceScore} 
              icon={Sparkles} 
              colorClass="text-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 size={20} className="text-accent-1" />
                Quality Gates
              </h3>
              <div className="flex flex-col gap-3">
                <GateStatus label="Security Compliance" status={dashboardData.qualityGates.security} />
                <GateStatus label="Reliability Rating" status={dashboardData.qualityGates.reliability} />
                <GateStatus label="Maintainability Rating" status={dashboardData.qualityGates.maintainability} />
                <GateStatus label="Test Coverage" status={dashboardData.qualityGates.coverage} />
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertCircle size={20} className="text-accent-3" />
                Issue Summary
              </h3>
              <div className="flex flex-col gap-4 justify-center flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Critical Issues</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${dashboardData.summary.criticalIssues > 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-secondary'}`}>
                    {dashboardData.summary.criticalIssues}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Major Issues</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${dashboardData.summary.majorIssues > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-secondary'}`}>
                    {dashboardData.summary.majorIssues}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Minor Issues</span>
                  <span className="bg-white/5 text-secondary px-3 py-1 rounded-full text-xs font-bold">
                    {dashboardData.summary.minorIssues}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-8">
        <div className="markdown-body">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  return (
                    <div className="relative group">
                      <pre className={className} {...props}>
                        <code>{children}</code>
                      </pre>
                      <button 
                        onClick={() => handleRefactor(codeContent, "Refactoring this block")}
                        className="refactor-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Sparkles size={14} />
                        Refactor with AI
                      </button>
                    </div>
                  );
                }
                return <code className={className} {...props}>{children}</code>;
              },
              h3({ children }) {
                const isResolved = resolvedIssues.has(String(children));
                return (
                  <div className={`flex items-center justify-between group mt-8 mb-4 border-b border-white/5 pb-2 transition-all ${isResolved ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex items-center gap-3">
                      <h3 className={`m-0 ${isResolved ? 'line-through' : ''}`}>{children}</h3>
                      {isResolved && (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                          <Check size={10} />
                          Resolved
                        </span>
                      )}
                    </div>
                    {!isResolved && (
                      <button 
                        onClick={() => {
                          setChatContext(String(children));
                          setChatOpen(true);
                        }}
                        className="text-[10px] uppercase font-bold text-accent-1 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 hover:text-white"
                      >
                        <MessageSquare size={12} />
                        Ask AI about this
                      </button>
                    )}
                  </div>
                );
              }
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>

      <ReportChat 
        report={report} 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        initialContext={chatContext} 
      />

      <FixModal 
        isOpen={fixModalOpen} 
        onClose={() => setFixModalOpen(false)} 
        issue={currentIssue}
        originalCode={selectedCode} 
        refactoredCode={refactoredCode}
        loading={fixLoading}
        onApply={() => {
          setResolvedIssues(prev => new Set(prev).add(currentIssue));
          setFixModalOpen(false);
        }}
      />
    </div>
  );
}
