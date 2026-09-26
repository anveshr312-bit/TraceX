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
  onScrubHop?: (hop: number) => void;
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
  onScrubHop,
  onChangeSpeed,
  isComplete,
}) => {
  const hopTitles: Record<number, string> = {
    0: 'Gas Funding & Pre-Attack',
    1: 'Hop 1: First Peel Splits',
    2: 'Hop 2: Mixer & Layering',
    3: 'Hop 3: Exchange Off-Ramps',
    4: 'Trace Complete (Overview)',
  };

  const hopLabels: { hop: number; label: string }[] = [
    { hop: 0, label: 'Gas' },
    { hop: 1, label: 'Peel' },
    { hop: 2, label: 'Mixer' },
    { hop: 3, label: 'VASP' },
    { hop: 4, label: 'All' },
  ];

  const progressPercent = Math.min(100, Math.max(0, (currentHop / maxHops) * 100));

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* Interactive Progress Scrub Bar */}
      <div className="w-80 sm:w-96 px-3 py-1.5 rounded-xl backdrop-blur-xl bg-slate-950/90 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.6)] font-mono">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
          <span className="flex items-center gap-1 text-cyan-400 font-semibold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>TRACE TIMELINE</span>
          </span>
          <span className="text-slate-300 font-bold tracking-wider">
            {progressPercent.toFixed(0)}% · {hopTitles[currentHop]}
          </span>
        </div>

        {/* Progress Track & Clickable Hop Checkpoints */}
        <div 
          className="relative h-2 w-full bg-slate-800/80 rounded-full cursor-pointer flex items-center group my-1.5"
          onClick={(e) => {
            if (!onScrubHop) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const targetHop = Math.round(clickRatio * maxHops);
            onScrubHop(targetHop);
          }}
        >
          {/* Active Gradient Bar */}
          <div 
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Clickable Hop Nodes */}
          {hopLabels.map(({ hop, label }) => {
            const leftPct = (hop / maxHops) * 100;
            const isPassed = hop <= currentHop;
            const isCurrent = hop === currentHop;

            return (
              <button
                key={hop}
                onClick={(e) => {
                  e.stopPropagation();
                  onScrubHop?.(hop);
                }}
                className={`absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'border-white bg-cyan-400 scale-125 shadow-[0_0_12px_rgba(0,229,255,1)] z-10'
                    : isPassed
                    ? 'border-cyan-400 bg-slate-950 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                    : 'border-slate-600 bg-slate-900 hover:border-slate-400'
                }`}
                style={{ left: `${leftPct}%` }}
                title={`Jump to ${hopTitles[hop]}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-white' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-0.5">
          {hopLabels.map(({ hop, label }) => (
            <span
              key={hop}
              onClick={() => onScrubHop?.(hop)}
              className={`cursor-pointer transition hover:text-white ${
                hop === currentHop ? 'text-cyan-300 font-bold' : hop < currentHop ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Floating Glassmorphism Controls Pill */}
      <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full backdrop-blur-xl bg-slate-950/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] font-mono text-xs text-slate-300">
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
    </div>
  );
};
