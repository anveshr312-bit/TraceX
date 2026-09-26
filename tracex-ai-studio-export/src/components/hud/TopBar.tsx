import React from 'react';
import { Shield, Radio, Activity, Network, Box, GitBranch, Plus, FileText, RotateCcw } from 'lucide-react';

interface TopBarProps {
  caseTitle: string;
  nodeCount: number;
  edgeCount: number;
  viewMode: '3d' | '2d';
  onToggleViewMode: (mode: '3d' | '2d') => void;
  onOpenNewInvestigation?: () => void;
  onOpenEvidence?: () => void;
  onResetCamera?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  caseTitle,
  nodeCount,
  edgeCount,
  viewMode,
  onToggleViewMode,
  onOpenNewInvestigation,
  onOpenEvidence,
  onResetCamera,
}) => {
  return (
    <header className="h-16 w-full px-5 flex items-center justify-between select-none backdrop-blur-xl bg-slate-950/75 border-b border-white/10 shadow-2xl z-30 pointer-events-auto">
      {/* Left: TraceX Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.45)]">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400 stroke-[2.2]" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-widest text-white drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
            TRACEX
          </span>
          <span className="text-[9px] font-mono tracking-widest text-cyan-400 -mt-1 uppercase">
            3D FORENSIC INTELLIGENCE
          </span>
        </div>
      </div>

      {/* Center: Case Title + View Toggle Pill */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 shadow-inner">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 font-mono tracking-tight max-w-[280px] truncate">
            {caseTitle}
          </span>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center p-1 rounded-full bg-slate-900/90 border border-white/10 shadow-inner font-mono text-xs">
          <button
            onClick={() => onToggleViewMode('3d')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D WebGL Graph</span>
          </button>
          <button
            onClick={() => onToggleViewMode('2d')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === '2d'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>2D Radial Tree</span>
          </button>
        </div>
      </div>

      {/* Right Cluster */}
      <div className="flex items-center gap-3">
        {/* New Investigation Button */}
        {onOpenNewInvestigation && (
          <button
            onClick={onOpenNewInvestigation}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-medium shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trace</span>
          </button>
        )}

        {/* Evidence Docket Button */}
        {onOpenEvidence && (
          <button
            onClick={onOpenEvidence}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-mono transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evidence</span>
          </button>
        )}

        {/* Reset Camera if in 3D */}
        {viewMode === '3d' && onResetCamera && (
          <button
            onClick={onResetCamera}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset 3D Orbit Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Threat Level Badge with animated gradient border */}
        <div className="relative p-[1.5px] rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,23,68,0.35)]">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />
          <div className="relative px-3 py-1 rounded-full bg-slate-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-400 tracking-wider">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Node & Edge counts */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{nodeCount} Nodes</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Network className="w-3 h-3 text-slate-400" />
            <span>{edgeCount} Edges</span>
          </div>
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/20">
            TX
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </div>
      </div>
    </header>
  );
};
