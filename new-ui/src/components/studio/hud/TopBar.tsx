import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Radio, Box, GitBranch, Plus, FileText, RotateCcw, Search, Zap, SlidersHorizontal, Sparkles, Network } from 'lucide-react';

interface TopBarProps {
  caseTitle: string;
  nodeCount: number;
  edgeCount: number;
  viewMode: '3d' | '2d';
  onToggleViewMode: (mode: '3d' | '2d') => void;
  onOpenNewInvestigation?: () => void;
  onOpenEvidence?: () => void;
  onResetCamera?: () => void;
  onOpenCopilot?: () => void;
  isLive?: boolean;
  onQuickTrace?: (hash: string, title: string) => void;
  isTracing?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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
  onOpenCopilot,
  isLive = false,
  onQuickTrace,
  isTracing = false,
  onToggleSidebar,
  isSidebarOpen = false,
}) => {

  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || isTracing) return;
    const clean = quickInput.trim();
    const shortLabel = clean.length > 12 ? `${clean.slice(0, 8)}...${clean.slice(-4)}` : clean;
    onQuickTrace?.(clean, `Case #TRX-2026 — Trace (${shortLabel})`);
  };

  const handleChipClick = (hash: string, label: string) => {
    setQuickInput(hash);
    onQuickTrace?.(hash, label);
  };

  return (
    <header className="h-16 w-full px-4 lg:px-6 flex items-center justify-between select-none backdrop-blur-xl bg-slate-950/85 border-b border-white/10 shadow-2xl z-30 pointer-events-auto">
      {/* Left: Back to Cases + TraceX Logo + Sidebar Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition cursor-pointer"
          title="Return to Cases Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Cases</span>
        </button>

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
              isSidebarOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/10'
            }`}
            title="Toggle Forensic Controls & Filters Sidebar"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Filters</span>
          </button>
        )}

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-[0_0_16px_rgba(0,229,255,0.45)]">
          <div className="w-full h-full rounded-[6px] bg-slate-950 flex items-center justify-center">
            <Shield className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-extrabold text-sm tracking-widest text-white drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
            TRACEX
          </span>
          <span className="text-[8.5px] font-mono tracking-widest text-cyan-400 -mt-1 uppercase">
            FORENSICS
          </span>
        </div>
      </div>

      {/* Center: Quick Search Bar + 1-Click Preset Chips */}
      <div className="flex items-center gap-2 max-w-xl">
        {onQuickTrace && (
          <form onSubmit={handleQuickSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Paste 0x address or tx hash..."
              className="w-48 sm:w-64 md:w-72 lg:w-80 h-8 pl-8 pr-16 rounded-xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:outline-none text-xs text-slate-100 font-mono transition shadow-inner placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isTracing || !quickInput.trim()}
              className="absolute right-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-[10.5px] font-mono transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>{isTracing ? '...' : 'Trace'}</span>
            </button>
          </form>
        )}

        {/* 1-Click Quick Preset Chips */}
        <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10.5px]">
          <button
            type="button"
            onClick={() => handleChipClick('0xa0427076e8a3ae2aca5e94928c71a54bbc02bd7c56930f4b126336a21baebc2d', 'Ronin Bridge Exploit (12,595 ETH)')}
            className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition cursor-pointer flex items-center gap-1"
            title="Load live on-chain Ronin Bridge Exploit trace"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ronin Hack</span>
          </button>
          <button
            type="button"
            onClick={() => handleChipClick('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik Buterin (vitalik.eth)')}
            className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition cursor-pointer flex items-center gap-1"
            title="Load live on-chain Vitalik Buterin EOA trace"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Vitalik.eth</span>
          </button>
        </div>

        {/* Live on-chain vs Simulation indicator */}
        <div className="hidden lg:flex items-center ml-1">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LIVE ON-CHAIN</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>SIMULATED</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Cluster: 3D/2D View Switcher + Actions */}
      <div className="flex items-center gap-3">
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
            <span>3D</span>
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
            <span>2D</span>
          </button>
        </div>
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

        {/* AI Copilot Button */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-medium shadow-sm transition cursor-pointer"
            title="Open AI Copilot (real on-chain data)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Copilot</span>
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
