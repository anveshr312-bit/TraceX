import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Box, GitBranch, Plus, FileText,
  RotateCcw, Search, Zap, SlidersHorizontal, Sparkles, Network, Radio
} from 'lucide-react';

// ── Design tokens matching login page "Forensic Dossier" palette ──────────────
// bg:      #161418  surface: #1C1A1E  elevated: #1F1B22
// border:  #2E2B32  divider: #252229
// text-hi: #EDE8DE  text-md: #A8A399  text-lo: #7E7972
// accent:  #B8935F  accent-hi: #CFAC78
// danger:  #C0392B  success: #4A7C59

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
    <header className="h-14 w-full px-4 lg:px-5 flex items-center justify-between select-none
      bg-[#161418]/95 backdrop-blur-md border-b border-[#2E2B32] shadow-lg z-30 pointer-events-auto">

      {/* ── LEFT: Logo + back + sidebar toggle ────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* Back to cases */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
            border border-[#2E2B32] text-xs font-mono transition cursor-pointer"
          title="Return to Cases Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#B8935F]" />
          <span className="hidden sm:inline">Cases</span>
        </button>

        {/* Filters sidebar toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
              isSidebarOpen
                ? 'bg-[#B8935F]/15 text-[#CFAC78] border-[#B8935F]/50'
                : 'bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE] border-[#2E2B32]'
            }`}
            title="Toggle Forensic Controls & Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-lg border border-[#B8935F]/40 bg-[#1F1B22]
            flex items-center justify-center text-[#B8935F]">
            <Shield className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-bold text-sm tracking-widest text-[#EDE8DE]">TRACEX</span>
            <span className="text-[8px] font-mono tracking-widest text-[#B8935F] uppercase">Forensics · I4C</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Trace search bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-1 max-w-2xl mx-4">
        {onQuickTrace && (
          <form onSubmit={handleQuickSubmit} className="relative flex items-center flex-1">
            <Search className="w-3.5 h-3.5 text-[#7E7972] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Paste transaction hash or wallet address (0x…)"
              className="w-full h-9 pl-9 pr-20 rounded-lg
                bg-[#1C1A1E] border border-[#2E2B32] focus:border-[#B8935F] focus:outline-none
                text-xs text-[#EDE8DE] font-mono placeholder:text-[#7E7972] transition"
            />
            <button
              type="submit"
              disabled={isTracing || !quickInput.trim()}
              className="absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-md
                bg-[#B8935F] hover:bg-[#CFAC78] text-[#131114] font-bold text-[10.5px] font-mono
                transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>{isTracing ? 'Tracing…' : 'Trace'}</span>
            </button>
          </form>
        )}

        {/* Preset chips */}
        <div className="hidden xl:flex items-center gap-1.5 font-mono text-[10.5px]">
          <button
            type="button"
            onClick={() => handleChipClick('0xa0427076e8a3ae2aca5e94928c71a54bbc02bd7c56930f4b126336a21baebc2d', 'Ronin Bridge Exploit (12,595 ETH)')}
            className="px-2 py-1 rounded bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
              border border-[#2E2B32] transition cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
            Ronin Hack
          </button>
          <button
            type="button"
            onClick={() => handleChipClick('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Vitalik Buterin (vitalik.eth)')}
            className="px-2 py-1 rounded bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
              border border-[#2E2B32] transition cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
            Vitalik.eth
          </button>
        </div>

        {/* Live / Simulated badge */}
        <div className="hidden lg:flex items-center">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded
              bg-[#1A2B1F] border border-[#4A7C59]/60 text-[#6BB58A] text-[10px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6BB58A] animate-pulse" />
              LIVE ON-CHAIN
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded
              bg-[#1F1B16] border border-[#B8935F]/40 text-[#B8935F] text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8935F]" />
              SIMULATED
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: View switcher + action buttons ─────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* 3D / 2D view switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#1C1A1E] border border-[#2E2B32] font-mono text-xs">
          <button
            onClick={() => onToggleViewMode('3d')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === '3d'
                ? 'bg-[#B8935F] text-[#131114] font-bold'
                : 'text-[#A8A399] hover:text-[#EDE8DE]'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D</span>
          </button>
          <button
            onClick={() => onToggleViewMode('2d')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === '2d'
                ? 'bg-[#B8935F] text-[#131114] font-bold'
                : 'text-[#A8A399] hover:text-[#EDE8DE]'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>2D</span>
          </button>
        </div>

        {/* New Trace */}
        {onOpenNewInvestigation && (
          <button
            onClick={onOpenNewInvestigation}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
              border border-[#2E2B32] text-xs font-mono transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B8935F]" />
            New Trace
          </button>
        )}

        {/* Evidence */}
        {onOpenEvidence && (
          <button
            onClick={onOpenEvidence}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
              border border-[#2E2B32] text-xs font-mono transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#B8935F]" />
            Evidence
          </button>
        )}

        {/* Copilot */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-[#B8935F]/10 hover:bg-[#B8935F]/20 text-[#B8935F] hover:text-[#CFAC78]
              border border-[#B8935F]/30 text-xs font-mono font-medium transition cursor-pointer"
            title="AI Forensic Copilot"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Copilot
          </button>
        )}

        {/* Reset camera */}
        {viewMode === '3d' && onResetCamera && (
          <button
            onClick={onResetCamera}
            className="p-2 rounded-lg bg-[#1F1B22] hover:bg-[#2A262F]
              border border-[#2E2B32] text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
            title="Reset 3D Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-[#2E2B32] hidden md:block" />

        {/* Node/Edge stats */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg
          bg-[#1C1A1E] border border-[#2E2B32] font-mono text-xs text-[#7E7972]">
          <div className="flex items-center gap-1.5 text-[#A8A399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8935F]" />
            {nodeCount} Wallets
          </div>
          <span className="text-[#2E2B32]">|</span>
          <div className="flex items-center gap-1.5">
            <Network className="w-3 h-3" />
            {edgeCount} Txns
          </div>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full border border-[#B8935F]/40 bg-[#1F1B22]
          flex items-center justify-center text-[10px] font-bold text-[#B8935F] font-mono">
          I4C
        </div>
      </div>
    </header>
  );
};
