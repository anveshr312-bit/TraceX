import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';

interface PlaybackControlBarProps {
  currentHop: number; // 0 to 4
  maxHops?: number;
  isPlaying: boolean;
  speed: 0.5 | 1 | 2;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  onChangeSpeed: (speed: 0.5 | 1 | 2) => void;
  isComplete: boolean;
}

export const PlaybackControlBar: React.FC<PlaybackControlBarProps> = ({
  currentHop,
  maxHops = 4,
  isPlaying,
  speed,
  onPlayPause,
  onStepForward,
  onStepBack,
  onSkipToStart,
  onSkipToEnd,
  onChangeSpeed,
  isComplete,
}) => {
  const hopTitles: Record<number, string> = {
    0: 'Gas Funding & Pre-Attack',
    1: 'Hop 1: First Peel Splits',
    2: 'Hop 2: Mixer & Layering',
    3: 'Hop 3: Exchange Off-Ramps',
    4: 'Trace Complete',
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none pointer-events-auto">
      {/* Floating Glassmorphism Pill */}
      <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-xl bg-slate-950/85 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono text-xs text-slate-300">
        {/* Skip to Start */}
        <button
          onClick={onSkipToStart}
          disabled={currentHop === 0 && !isPlaying}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white transition cursor-pointer"
          title="Skip to Start (Hop 0)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Step Back */}
        <button
          onClick={onStepBack}
          disabled={currentHop === 0 || isPlaying}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white transition cursor-pointer"
          title="Step Back 1 Hop"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play / Pause / Replay Button */}
        <button
          onClick={onPlayPause}
          className={`px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
            isComplete
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
              : isPlaying
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
          }`}
          title={isComplete ? 'Replay Trace' : isPlaying ? 'Pause Playback' : 'Play Trace Hopping'}
        >
          {isComplete ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Replay</span>
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span>Play</span>
            </>
          )}
        </button>

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          disabled={currentHop >= maxHops || isPlaying}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white transition cursor-pointer"
          title="Step Forward 1 Hop"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Skip to End */}
        <button
          onClick={onSkipToEnd}
          disabled={currentHop === maxHops && !isPlaying}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white transition cursor-pointer"
          title="Skip to End (All Hops)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Hop Indicator */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold text-slate-200 tracking-wider">
            Hop {currentHop} / {maxHops}
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((h) => (
              <span
                key={h}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  h <= currentHop
                    ? h === 4
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : 'bg-cyan-400 shadow-[0_0_6px_rgba(0,229,255,0.8)]'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-full p-0.5 border border-white/10 text-[10px]">
          {([0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded-full transition cursor-pointer ${
                speed === s
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Sub-label describing current hop */}
      <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-cyan-300/80 drop-shadow-sm">
        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>{hopTitles[currentHop]}</span>
      </div>
    </div>
  );
};
