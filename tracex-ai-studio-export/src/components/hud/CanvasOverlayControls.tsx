import React from 'react';
import { RotateCcw, Box, Layers, Maximize2 } from 'lucide-react';

interface CanvasOverlayControlsProps {
  dimensionMode: '3D' | '2D';
  onToggleDimension: (mode: '3D' | '2D') => void;
  onResetView: () => void;
  showTraceCompleteToast?: boolean;
}

export const CanvasOverlayControls: React.FC<CanvasOverlayControlsProps> = ({
  dimensionMode,
  onToggleDimension,
  onResetView,
  showTraceCompleteToast,
}) => {
  return (
    <>
      {/* Top-Right Floating Controls */}
      <div className="absolute top-20 right-6 z-20 flex items-center gap-2 select-none pointer-events-auto">
        {/* 2D / 3D Segmented Control */}
        <div className="flex items-center p-1 rounded-full backdrop-blur-xl bg-slate-950/80 border border-white/10 shadow-2xl font-mono text-xs">
          <button
            onClick={() => onToggleDimension('2D')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
              dimensionMode === '2D'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D</span>
          </button>
          <button
            onClick={() => onToggleDimension('3D')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
              dimensionMode === '3D'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
        </div>

        {/* Reset View Button */}
        <button
          onClick={onResetView}
          className="p-2 rounded-full backdrop-blur-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/40 text-slate-400 hover:text-cyan-300 shadow-2xl transition cursor-pointer group"
          title="Reset View to Overview"
        >
          <RotateCcw className="w-4 h-4 group-hover:-rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* Trace Complete Toast Notification at center-bottom */}
      {showTraceCompleteToast && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
          <div className="px-5 py-2.5 rounded-full backdrop-blur-xl bg-slate-950/90 border border-emerald-400/50 shadow-[0_0_25px_rgba(52,211,153,0.35)] flex items-center gap-2.5 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-300 tracking-wider uppercase">
              Trace Complete
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">All 4 Hops Resolved to VASP Exits</span>
          </div>
        </div>
      )}
    </>
  );
};
