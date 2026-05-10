'use client';
import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, CheckSquare, Square, Search } from 'lucide-react';

const FileIcon = ({ name }) => {
  const ext = name.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx': return <span className="text-yellow-400 font-bold text-[10px] w-4 text-center">JS</span>;
    case 'ts':
    case 'tsx': return <span className="text-blue-400 font-bold text-[10px] w-4 text-center">TS</span>;
    case 'py': return <span className="text-blue-500 font-bold text-[10px] w-4 text-center">PY</span>;
    case 'go': return <span className="text-cyan-400 font-bold text-[10px] w-4 text-center">GO</span>;
    default: return <File size={16} className="text-secondary" />;
  }
};

export default function FileExplorer({ tree, onSelectFiles, onCancel, scores = {} }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['']));
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [heatmapMode, setHeatmapMode] = useState(false);

  const getScoreColor = (path) => {
    if (!heatmapMode || !scores[path]) return '';
    const score = scores[path];
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 border';
    if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/20 border';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/20 border';
  };

  // Convert flat tree to nested object
  const buildTree = (items) => {
    const root = { name: 'root', type: 'tree', children: {}, path: '' };
    items.forEach(item => {
      const parts = item.path.split('/');
      let current = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          if (item.type === 'blob') {
            current.children[part] = { ...item, name: part, children: null };
          } else {
            current.children[part] = current.children[part] || { name: part, type: 'tree', children: {}, path: item.path };
          }
        } else {
          current.children[part] = current.children[part] || { name: part, type: 'tree', children: {}, path: parts.slice(0, index + 1).join('/') };
          current = current.children[part];
        }
      });
    });
    return root;
  };

  const nestedTree = buildTree(tree);

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) newExpanded.delete(path);
    else newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const toggleFile = (path) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) newSelected.delete(path);
    else newSelected.add(path);
    setSelectedFiles(newSelected);
  };

  const renderItem = (item, depth = 0) => {
    const isFolder = item.type === 'tree';
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFiles.has(item.path);

    if (searchTerm && !item.path.toLowerCase().includes(searchTerm.toLowerCase()) && !isFolder) {
      return null;
    }

    return (
      <div key={item.path} className="flex flex-col">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded-md transition-all cursor-pointer hover:bg-white/5 ${isSelected ? 'bg-accent-1/10' : ''} ${getScoreColor(item.path)}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => isFolder ? toggleFolder(item.path) : toggleFile(item.path)}
        >
          {isFolder ? (
            <>
              {isExpanded ? <ChevronDown size={14} className="text-secondary" /> : <ChevronRight size={14} className="text-secondary" />}
              <Folder size={16} className="text-accent-1" />
            </>
          ) : (
            <>
              <div className="w-3" />
              <FileIcon name={item.name} />
            </>
          )}
          <span className={`text-sm ${isFolder ? 'font-medium' : 'text-secondary'}`}>{item.name}</span>
          {heatmapMode && scores[item.path] && (
            <span className="text-[10px] font-bold ml-2 opacity-60">
              {scores[item.path]}%
            </span>
          )}
          {!isFolder && (
            <div className="ml-auto">
              {isSelected ? <CheckSquare size={16} className="text-accent-1" /> : <Square size={16} className="text-white/10" />}
            </div>
          )}
        </div>
        {isFolder && isExpanded && (
          <div>
            {Object.values(item.children)
              .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1))
              .map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel w-full max-w-2xl mx-auto mt-8 flex flex-col overflow-hidden animate-slide-up">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">Select Files for Analysis</h3>
          <p className="text-[10px] text-secondary">{selectedFiles.size} files selected</p>
        </div>
        
        <div className="flex items-center gap-4">
          {Object.keys(scores).length > 0 && (
            <div className="flex items-center gap-3 border-r border-white/5 pr-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" title="Healthy" />
                <div className="w-2 h-2 rounded-full bg-amber-500" title="Needs Attention" />
                <div className="w-2 h-2 rounded-full bg-rose-500" title="Critical" />
              </div>
              <button 
                onClick={() => setHeatmapMode(!heatmapMode)}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-all ${heatmapMode ? 'bg-accent-1 text-white' : 'bg-white/5 text-secondary hover:text-white'}`}
              >
                Heatmap
              </button>
            </div>
          )}
          <div className="flex gap-3">
          <button onClick={onCancel}
            className="overflow-hidden group/btn"
            style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '14px', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          >
            <div className="flex items-center gap-2 py-2 px-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#1e1b4b)', borderRadius: '13px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              Cancel
            </div>
          </button>
          <button
            onClick={() => onSelectFiles(Array.from(selectedFiles))}
            disabled={selectedFiles.size === 0}
            className="overflow-hidden group/btn disabled:opacity-40 disabled:pointer-events-none"
            style={{ padding: '1px', background: 'linear-gradient(135deg,rgba(129,140,248,0.8),rgba(168,85,247,0.6) 50%,rgba(99,102,241,0.8))', borderRadius: '14px', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
          >
            <div className="relative flex items-center gap-2 py-2 px-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all" style={{ background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#1e1b4b)', borderRadius: '13px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="drop-shadow-[0_0_6px_rgba(129,140,248,0.8)]">Analyze Selected ({selectedFiles.size})</span>
            </div>
          </button>
        </div>
      </div>
    </div>

      <div className="p-2 border-b border-white/5 bg-black/20">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-secondary" size={14} />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-transparent text-sm py-2 pl-9 pr-4 outline-none border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px] p-2 custom-scrollbar">
        {Object.values(nestedTree.children)
          .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1))
          .map(item => renderItem(item))}
      </div>
    </div>
  );
}
