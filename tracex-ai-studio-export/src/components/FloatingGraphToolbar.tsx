import React, { useState } from 'react';
import { VisMode } from '../types/forensics';
import { 
  GitFork, 
  Network, 
  Flame, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Maximize2, 
  Plus, 
  Search,
  X,
  Layers
} from 'lucide-react';

interface FloatingGraphToolbarProps {
  visMode: VisMode;
  onChangeVisMode: (mode: VisMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
  onNewInvestigation: () => void;
  filterText: string;
  onFilterChange: (val: string) => void;
}

export const FloatingGraphToolbar: React.FC<FloatingGraphToolbarProps> = ({
  visMode,
  onChangeVisMode,
  onZoomIn,
  onZoomOut,
  onResetView,
  expandAll,
  onToggleExpandAll,
  onNewInvestigation,
  filterText,
  onFilterChange,
}) => {
  const [showFilterInput, setShowFilterInput] = useState(false);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 max-w-[96vw]">
      {/* Central Glassmorphic Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#101217]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] select-none">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/5">
          <button
            onClick={() => onChangeVisMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              visMode === 'tree'
                ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#00F2FE]/30 text-white border border-[#00F2FE]/40 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.25)]'
                : 'text-[#8E8B83] hover:text-[#EEEBE2]'
            }`}
            title="Hierarchical Radial Dendrogram / Fiber-Optic Branching Tree"
          >
            <GitFork className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden sm:inline">Tree Branching</span>
          </button>

          <button
            onClick={() => onChangeVisMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              visMode === 'graph'
                ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#00F2FE]/30 text-white border border-[#00F2FE]/40 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.25)]'
                : 'text-[#8E8B83] hover:text-[#EEEBE2]'
            }`}
            title="Relational Network Topology"
          >
            <Network className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="hidden sm:inline">Force Network</span>
          </button>

          <button
            onClick={() => onChangeVisMode('heat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              visMode === 'heat'
                ? 'bg-[#EF4444]/25 text-[#FFA39E] border border-[#EF4444]/40 font-semibold shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                : 'text-[#8E8B83] hover:text-[#EEEBE2]'
            }`}
            title="Taint Velocity & Rapid-Dwell Heatmap"
          >
            <Flame className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="hidden sm:inline">Taint Heatmap</span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Controls: Zoom, Reset, Expand All, Filter */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onZoomIn}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8B83] hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8B83] hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetView}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8B83] hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Expand All Branches Toggle */}
          <button
            onClick={onToggleExpandAll}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition cursor-pointer ml-1 ${
              expandAll
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-semibold'
                : 'text-[#8E8B83] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Show all category terminals simultaneously"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden md:inline">{expandAll ? 'All Branches' : 'Expand All'}</span>
          </button>

          {/* Node Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterInput(!showFilterInput)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                filterText || showFilterInput
                  ? 'text-[#00F2FE] bg-[#00F2FE]/10'
                  : 'text-[#8E8B83] hover:text-white hover:bg-white/10'
              }`}
              title="Filter Nodes"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>

            {showFilterInput && (
              <div className="absolute top-full mt-2 -left-20 w-52 p-1.5 rounded-lg bg-[#0E1015] border border-white/10 shadow-2xl z-50 flex items-center gap-1">
                <Search className="w-3 h-3 text-[#71747E] ml-1" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => onFilterChange(e.target.value)}
                  placeholder="Filter terminals..."
                  autoFocus
                  className="w-full bg-transparent text-xs text-white placeholder:text-[#555861] font-mono focus:outline-none px-1"
                />
                {filterText && (
                  <button
                    onClick={() => onFilterChange('')}
                    className="text-[#71747E] hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button: + New Investigation */}
      <button
        onClick={onNewInvestigation}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] text-black font-semibold text-xs shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_26px_rgba(0,242,254,0.55)] transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="font-sans tracking-tight">New Investigation</span>
      </button>
    </div>
  );
};
