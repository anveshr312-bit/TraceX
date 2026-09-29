import React from 'react';
import { RotateCcw, Box, Layers } from 'lucide-react';

interface CanvasOverlayControlsProps {
  dimensionMode: '3D' | '2D';
  onToggleDimension: (mode: '3D' | '2D') => void;
  onResetView: () => void;
  showTraceCompleteToast?: boolean;
  isDossierOpen?: boolean;
}

export const CanvasOverlayControls: React.FC<CanvasOverlayControlsProps> = ({
  dimensionMode,
  onToggleDimension,
  onResetView,
  showTraceCompleteToast,
  isDossierOpen = false,
}) => {
  return (
    <>
      {/* Interaction hint — top-left, subtle */}
      <div className="absolute top-16 left-4 z-20 hidden md:flex items-center gap-2
        px-3 py-1.5 rounded-lg bg-[#161418]/80 border border-[#2E2B32]
        text-[#7E7972] font-mono text-[10px] shadow-md pointer-events-auto select-none">
        <span className="text-[#B8935F] font-semibold">CONTROLS</span>
        <span className="text-[#252229]">·</span>
        <span>Drag to rotate</span>
        <span className="text-[#252229]">·</span>
        <span>Scroll to zoom</span>
        <span className="text-[#252229]">·</span>
        <span className="text-[#4A7C59]">Click node to inspect</span>
      </div>

      {/* Top-right: dimension switcher + recenter */}
      <div className={`absolute top-16 ${isDossierOpen ? 'right-[420px]' : 'right-4'}
        z-20 flex items-center gap-2 select-none pointer-events-auto transition-all duration-300`}>

        {/* 2D / 3D toggle */}
        <div className="flex items-center p-0.5 rounded-lg
          bg-[#161418]/90 border border-[#2E2B32] shadow-lg font-mono text-xs">
          <button
            onClick={() => onToggleDimension('2D')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5
              transition cursor-pointer ${
              dimensionMode === '2D'
                ? 'bg-[#B8935F] text-[#131114] font-bold'
                : 'text-[#7E7972] hover:text-[#EDE8DE]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2D</span>
          </button>
          <button
            onClick={() => onToggleDimension('3D')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5
              transition cursor-pointer ${
              dimensionMode === '3D'
                ? 'bg-[#B8935F] text-[#131114] font-bold'
                : 'text-[#7E7972] hover:text-[#EDE8DE]'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D</span>
          </button>
        </div>

        {/* Recenter */}
        <button
          onClick={onResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-[#161418]/90 hover:bg-[#1F1B22] border border-[#2E2B32]
            text-[#A8A399] hover:text-[#EDE8DE] font-mono text-xs transition cursor-pointer shadow-md"
          title="Recenter camera (or press Esc)"
        >
          <RotateCcw className="w-3 h-3 text-[#B8935F]" />
          <span>Recenter</span>
        </button>
      </div>

      {/* Trace complete toast */}
      {showTraceCompleteToast && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30
          pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="px-5 py-2.5 rounded-lg bg-[#141F17]/95 border border-[#4A7C59]/60
            shadow-xl flex items-center gap-2.5 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#6BB58A]" />
            <span className="font-bold text-[#6BB58A] tracking-wider uppercase">
              Trace Complete
            </span>
            <span className="text-[#2E2B32]">·</span>
            <span className="text-[#A8A399]">All 4 hops resolved to VASP exits</span>
          </div>
        </div>
      )}
    </>
  );
};
