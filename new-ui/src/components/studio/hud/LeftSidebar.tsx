import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Loader2, Eye, EyeOff,
  Target, Sliders, Zap, Layers
} from 'lucide-react';
import { NodeType, ForensicFindingItem } from '../../../types/graph3d';
import { NODE_CONFIG } from '../Scene3D';
import { PRESET_TRACES } from '../../../data/graph3dData';

// ── Severity styles matching dossier palette ───────────────────────────────────
const SEVERITY_STYLES: Record<string, { bar: string; badge: string; text: string }> = {
  CRITICAL: { bar: 'border-l-[#C0392B]', badge: 'bg-[#2A1519] text-[#E24A4A]', text: 'text-[#E24A4A]' },
  HIGH:     { bar: 'border-l-[#B8592F]', badge: 'bg-[#2A1A15] text-[#D97040]', text: 'text-[#D97040]' },
  MEDIUM:   { bar: 'border-l-[#B8935F]', badge: 'bg-[#1F1B16] text-[#CFAC78]', text: 'text-[#CFAC78]' },
  LOW:      { bar: 'border-l-[#4A7C59]', badge: 'bg-[#141F17] text-[#6BB58A]', text: 'text-[#6BB58A]' },
};

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
    const clean = txHashInput.trim();
    const shortLabel = clean.length > 10 ? `${clean.slice(0, 8)}...${clean.slice(-4)}` : clean;
    onRunTrace(clean, `Case #TRX-2024 — Trace (${shortLabel})`);
  };

  const handleSelectPreset = (preset: typeof PRESET_TRACES[0]) => {
    setTxHashInput(preset.hash);
    onRunTrace(preset.hash, preset.caseTitle);
  };

  const allNodeTypes: NodeType[] = [
    'FRAUD_ORIGIN', 'PEEL_CHAIN', 'MIXER',
    'EXCHANGE_EXIT', 'GAS_SPONSOR', 'INTERMEDIATE',
  ];

  // ── Collapsed state: just an icon strip ──────────────────────────────────
  if (isCollapsed) {
    return (
      <aside className="w-10 h-auto self-start mt-2 bg-[#161418]/90 border border-[#2E2B32]
        rounded-xl flex flex-col items-center py-3 px-1 select-none pointer-events-auto
        transition-all duration-300 shadow-lg">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-[#1F1B22] border border-[#2E2B32]
            text-[#B8935F] hover:text-[#CFAC78] hover:bg-[#2A262F] transition cursor-pointer"
          title="Open Forensic Controls"
        >
          <Sliders className="w-4 h-4" />
        </button>
        <span className="text-[9px] font-mono text-[#7E7972] [writing-mode:vertical-rl]
          rotate-180 mt-4 tracking-widest uppercase">
          CONTROLS
        </span>
      </aside>
    );
  }

  return (
    <aside className="w-72 lg:w-80 h-full bg-[#161418]/95 backdrop-blur-md
      border-r border-[#2E2B32] flex flex-col select-none pointer-events-auto
      transition-all duration-300 overflow-hidden shadow-xl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="h-11 px-4 border-b border-[#2E2B32] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#B8935F]" />
          <span className="text-[11px] font-semibold text-[#EDE8DE] tracking-wider font-mono uppercase">
            Investigation Controls
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-[#2A262F] text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Section 1: Trace Input ──────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7E7972] uppercase tracking-wider">
              Trace Transaction
            </span>
            <span className="text-[10px] font-mono text-[#B8935F]">Blockscout · Mainnet</span>
          </div>

          <form onSubmit={handleTraceClick} className="space-y-2">
            <input
              type="text"
              value={txHashInput}
              onChange={(e) => setTxHashInput(e.target.value)}
              placeholder="0x… transaction hash or address"
              className="w-full h-9 px-3 rounded-lg bg-[#1C1A1E] border border-[#2E2B32]
                focus:border-[#B8935F] focus:outline-none text-[11px] font-mono
                text-[#EDE8DE] placeholder:text-[#7E7972] transition"
            />
            <button
              type="submit"
              disabled={isTracing}
              className="w-full h-9 rounded-lg bg-[#B8935F] hover:bg-[#CFAC78]
                text-[#131114] font-bold text-xs flex items-center justify-center gap-2
                transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTracing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Traversing chains…</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-[#131114]" />
                  <span>Execute Trace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick presets */}
          <div>
            <span className="text-[9px] font-mono text-[#7E7972] uppercase tracking-wider block mb-1.5">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1">
              {PRESET_TRACES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSelectPreset(p)}
                  className="px-2 py-1 rounded text-[10px] font-mono
                    bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE]
                    border border-[#2E2B32] transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#2E2B32]" />

        {/* ── Section 2: Node Legend & Filters ───────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7E7972] uppercase tracking-wider">
              Node Legend
            </span>
            <span className="text-[9px] text-[#7E7972]">Toggle Visibility</span>
          </div>

          <div className="space-y-1">
            {allNodeTypes.map((type) => {
              const cfg = NODE_CONFIG[type];
              const isHidden = hiddenNodeTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleNodeType(type)}
                  className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-mono
                    flex items-center justify-between transition cursor-pointer border ${
                    isHidden
                      ? 'bg-[#1C1A1E]/40 text-[#7E7972] line-through border-[#252229]'
                      : 'bg-[#1F1B22] hover:bg-[#2A262F] text-[#A8A399] hover:text-[#EDE8DE] border-[#2E2B32]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: isHidden ? '#555' : cfg.color }}
                    />
                    <span className="text-[11px]">{cfg.label}</span>
                  </div>
                  {isHidden
                    ? <EyeOff className="w-3 h-3 text-[#555]" />
                    : <Eye className="w-3 h-3 text-[#B8935F]" />
                  }
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-[#2E2B32]" />

        {/* ── Section 3: Intelligence Findings ──────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7E7972] uppercase tracking-wider">
              Intelligence Findings
            </span>
            {findings.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#E24A4A]">
                {findings.length} Anomalies
              </span>
            )}
          </div>

          {findings.length === 0 ? (
            <p className="text-[11px] text-[#7E7972] font-sans italic px-1">
              No findings yet. Run a trace to generate intelligence reports.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {findings.map((f) => {
                const style = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.MEDIUM;
                return (
                  <div
                    key={f.id}
                    className={`p-3 rounded-lg bg-[#1C1A1E] border border-[#2E2B32]
                      border-l-4 ${style.bar} space-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5
                        rounded ${style.badge}`}>
                        {f.severity} · {f.code}
                      </span>
                      <button
                        onClick={() => onFocusFinding(f.matchedNodeIds)}
                        className="flex items-center gap-1 text-[10px] font-mono
                          text-[#B8935F] hover:text-[#CFAC78] transition cursor-pointer"
                      >
                        <Target className="w-3 h-3" />
                        <span>Focus</span>
                      </button>
                    </div>
                    <div className="text-[11px] font-semibold text-[#EDE8DE] leading-tight">
                      {f.title}
                    </div>
                    <div className="text-[10px] text-[#A8A399] leading-relaxed">
                      {f.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-px bg-[#2E2B32]" />

        {/* ── Section 4: Timeline Scrubber ──────────────────────────── */}
        <div className="space-y-2.5 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7E7972] uppercase tracking-wider">
              Block Timeline
            </span>
            <span className="text-[10px] font-mono font-bold text-[#B8935F]">
              #{timelineBlock.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={minBlock}
            max={maxBlock}
            value={timelineBlock}
            onChange={(e) => onTimelineChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#B8935F]
              bg-[#252229]"
          />
          <div className="flex justify-between text-[9px] font-mono text-[#7E7972]">
            <span>#{minBlock.toLocaleString()}</span>
            <span>#{maxBlock.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
