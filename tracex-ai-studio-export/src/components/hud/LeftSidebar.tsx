import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  Eye, 
  EyeOff, 
  Target, 
  AlertTriangle, 
  Sliders, 
  Zap,
  Layers,
  Circle,
  Box,
  Disc
} from 'lucide-react';
import { NodeType, ForensicFindingItem } from '../../types/graph3d';
import { NODE_CONFIG } from '../Scene3D';
import { PRESET_TRACES } from '../../data/graph3dData';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRunTrace: (hash: string, caseTitle: string) => void;
  isTracing: boolean;
  hiddenNodeTypes: Set<NodeType>;
  onToggleNodeType: (type: NodeType) => void;
  findings: ForensicFindingItem[];
  onFocusFinding: (matchedNodeIds: string[]) => void;
  timelineBlock: number;
  onTimelineChange: (block: number) => void;
  minBlock: number;
  maxBlock: number;
}

const SEVERITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  CRITICAL: { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
  HIGH: { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  MEDIUM: { border: 'border-l-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400' },
  LOW: { border: 'border-l-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onRunTrace,
  isTracing,
  hiddenNodeTypes,
  onToggleNodeType,
  findings,
  onFocusFinding,
  timelineBlock,
  onTimelineChange,
  minBlock,
  maxBlock,
}) => {
  const [txHashInput, setTxHashInput] = useState('0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97');

  const handleTraceClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHashInput.trim() || isTracing) return;
    onRunTrace(txHashInput, 'Case #TRX-2024-00847 — Phishing Drain');
  };

  const handleSelectPreset = (preset: typeof PRESET_TRACES[0]) => {
    setTxHashInput(preset.hash);
    onRunTrace(preset.hash, preset.caseTitle);
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 h-full backdrop-blur-xl bg-slate-950/70 border-r border-white/10 flex flex-col items-center py-4 select-none pointer-events-auto transition-all duration-300">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Expand Control Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-mono text-slate-500 [writing-mode:vertical-rl] rotate-180 mt-8 tracking-widest uppercase">
          FORENSIC CONTROLS
        </span>
      </aside>
    );
  }

  const allNodeTypes: NodeType[] = [
    'FRAUD_ORIGIN',
    'PEEL_CHAIN',
    'MIXER',
    'EXCHANGE_EXIT',
    'GAS_SPONSOR',
    'INTERMEDIATE',
  ];

  return (
    <aside className="w-72 lg:w-80 h-full backdrop-blur-xl bg-slate-950/70 border-r border-white/10 flex flex-col select-none pointer-events-auto transition-all duration-300 overflow-hidden shadow-2xl">
      {/* Sidebar Header with Collapse Toggle */}
      <div className="h-10 px-4 border-b border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="text-[11px] font-semibold text-slate-200 tracking-wider">INVESTIGATION COCKPIT</span>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Section 1: Trace Input */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Trace Transaction</span>
            <span className="text-cyan-400">Heuristic Engine</span>
          </div>

          <form onSubmit={handleTraceClick} className="space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                placeholder="Fraud Transaction Hash 0x..."
                className="w-full h-8 pl-2.5 pr-2 rounded-xl bg-slate-900/80 border border-white/10 focus:border-cyan-400 focus:outline-none text-[11px] font-mono text-white placeholder:text-slate-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isTracing}
              className="w-full h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.35)] transition cursor-pointer disabled:opacity-50"
            >
              {isTracing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Traversing Chains (2.0s)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Execute 3D Trace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1">
              {PRESET_TRACES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSelectPreset(p)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Section 2: Node Legend (Filter Visibility) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Node Legend & Filters</span>
            <span className="text-[9px] text-slate-500">Toggle Visibility</span>
          </div>

          <div className="space-y-1">
            {allNodeTypes.map((type) => {
              const cfg = NODE_CONFIG[type];
              const isHidden = hiddenNodeTypes.has(type);

              return (
                <button
                  key={type}
                  onClick={() => onToggleNodeType(type)}
                  className={`w-full px-2 py-1 rounded-lg text-left text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                    isHidden 
                      ? 'bg-slate-900/30 text-slate-600 line-through' 
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: cfg.color,
                        boxShadow: isHidden ? 'none' : `0 0 8px ${cfg.color}80` 
                      }}
                    />
                    <span className="text-[11px] truncate">{cfg.label}</span>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Section 3: Intelligence Findings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Intelligence Findings</span>
            <span className="text-red-400 font-bold">{findings.length} Anomalies</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {findings.map((f) => {
              const style = SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.MEDIUM;

              return (
                <div
                  key={f.id}
                  className={`p-2.5 rounded-xl bg-slate-900/70 border border-white/5 border-l-4 ${style.border} space-y-1.5 hover:border-white/20 transition`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${style.bg} ${style.text}`}>
                      [{f.severity}] {f.code}
                    </span>
                    <button
                      onClick={() => onFocusFinding(f.matchedNodeIds)}
                      className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-white transition cursor-pointer"
                    >
                      <Target className="w-3 h-3" />
                      <span>Focus</span>
                    </button>
                  </div>
                  <div className="text-[11px] font-bold text-slate-100 font-sans leading-tight">
                    {f.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    {f.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Section 4: Timeline Scrubber */}
        <div className="space-y-2.5 pb-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Timeline Scrubber</span>
            <span className="text-cyan-400 font-bold">Block {timelineBlock.toLocaleString()}</span>
          </div>

          {/* Glowing Track Slider */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={minBlock}
              max={maxBlock}
              value={timelineBlock}
              onChange={(e) => onTimelineChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)]"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Block {minBlock.toLocaleString()}</span>
              <span>Block {maxBlock.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
