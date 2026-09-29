import React from 'react';
import {
  Play, Pause, RotateCcw, SkipBack, SkipForward,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface PlaybackControlBarProps {
  currentHop: number;
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

const HOP_TITLES: Record<number, string> = {
  0: 'Origin Wallet',
  1: 'Hop 1 — First Splits',
  2: 'Hop 2 — Layering',
  3: 'Hop 3 — Off-Ramps',
  4: 'Complete — Overview',
};

const HOP_LABELS = [
  { hop: 0, label: 'Origin' },
  { hop: 1, label: 'Hop 1' },
  { hop: 2, label: 'Hop 2' },
  { hop: 3, label: 'Hop 3' },
  { hop: 4, label: 'All' },
];

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
  const progressPercent = Math.min(100, Math.max(0, (currentHop / maxHops) * 100));

  return (
    <div className="flex flex-col items-center gap-2 select-none pointer-events-auto">

      {/* ── Progress scrub bar ─────────────────────────────────────── */}
      <div className="w-80 sm:w-96 px-3 py-2.5 rounded-xl
        bg-[#161418]/95 backdrop-blur-md border border-[#2E2B32] shadow-xl font-mono">

        <div className="flex justify-between items-center text-[10px] mb-2">
          <span className="text-[#7E7972] font-semibold uppercase tracking-wider">
            Trace Timeline
          </span>
          <span className="text-[#A8A399]">
            {HOP_TITLES[currentHop]}
          </span>
        </div>

        {/* Track */}
        <div
          className="relative h-1.5 w-full bg-[#252229] rounded-full cursor-pointer my-2"
          onClick={(e) => {
            if (!onScrubHop) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onScrubHop(Math.round(ratio * maxHops));
          }}
        >
          {/* Filled bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[#B8935F] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Hop dots */}
          {HOP_LABELS.map(({ hop }) => {
            const leftPct = (hop / maxHops) * 100;
            const isPassed = hop <= currentHop;
            const isCurrent = hop === currentHop;
            return (
              <button
                key={hop}
                onClick={(e) => { e.stopPropagation(); onScrubHop?.(hop); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2
                  w-3.5 h-3.5 rounded-full border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#CFAC78] bg-[#B8935F] scale-125 z-10'
                    : isPassed
                    ? 'border-[#B8935F] bg-[#161418]'
                    : 'border-[#2E2B32] bg-[#1C1A1E] hover:border-[#7E7972]'
                }`}
                style={{ left: `${leftPct}%` }}
                title={`Jump to ${HOP_TITLES[hop]}`}
              />
            );
          })}
        </div>

        {/* Milestone labels */}
        <div className="flex justify-between text-[9px] font-mono text-[#7E7972] mt-1">
          {HOP_LABELS.map(({ hop, label }) => (
            <span
              key={hop}
              onClick={() => onScrubHop?.(hop)}
              className={`cursor-pointer transition ${
                hop === currentHop
                  ? 'text-[#CFAC78] font-bold'
                  : hop < currentHop
                  ? 'text-[#A8A399]'
                  : 'text-[#555]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Control pill ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl
        bg-[#161418]/95 backdrop-blur-md border border-[#2E2B32] shadow-xl
        font-mono text-xs text-[#A8A399]">

        <button
          onClick={onSkipToStart}
          disabled={currentHop === 0 && !isPlaying}
          className="p-1.5 rounded-lg hover:bg-[#2A262F] disabled:opacity-30
            text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
          title="Skip to Start"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onStepBack}
          disabled={currentHop === 0 || isPlaying}
          className="p-1.5 rounded-lg hover:bg-[#2A262F] disabled:opacity-30
            text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
          title="Step Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play / Pause / Replay */}
        <button
          onClick={onPlayPause}
          className={`px-4 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5
            transition cursor-pointer ${
            isComplete
              ? 'bg-[#1F1B22] border border-[#B8935F] text-[#B8935F] hover:bg-[#B8935F]/10'
              : isPlaying
              ? 'bg-[#2A1519] border border-[#522329] text-[#E24A4A]'
              : 'bg-[#B8935F] text-[#131114] hover:bg-[#CFAC78]'
          }`}
          title={isComplete ? 'Replay' : isPlaying ? 'Pause' : 'Play Trace'}
        >
          {isComplete ? (
            <><RotateCcw className="w-3.5 h-3.5" /><span>Replay</span></>
          ) : isPlaying ? (
            <><Pause className="w-3.5 h-3.5 fill-current" /><span>Pause</span></>
          ) : (
            <><Play className="w-3.5 h-3.5 fill-current ml-0.5" /><span>Play</span></>
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentHop >= maxHops || isPlaying}
          className="p-1.5 rounded-lg hover:bg-[#2A262F] disabled:opacity-30
            text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
          title="Step Forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onSkipToEnd}
          disabled={currentHop === maxHops && !isPlaying}
          className="p-1.5 rounded-lg hover:bg-[#2A262F] disabled:opacity-30
            text-[#7E7972] hover:text-[#EDE8DE] transition cursor-pointer"
          title="Show All Hops"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#2E2B32] mx-1" />

        {/* Hop indicator */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] font-bold text-[#A8A399]">
            Hop {currentHop}/{maxHops}
          </span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((h) => (
              <span
                key={h}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  h <= currentHop
                    ? h === 4 ? 'bg-[#4A7C59]' : 'bg-[#B8935F]'
                    : 'bg-[#2E2B32]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-[#2E2B32] mx-1" />

        {/* Speed selector */}
        <div className="flex items-center gap-0.5 bg-[#1C1A1E] rounded-lg p-0.5
          border border-[#2E2B32] text-[10px]">
          {([0.5, 1, 2] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                speed === s
                  ? 'bg-[#B8935F] text-[#131114] font-bold'
                  : 'text-[#7E7972] hover:text-[#EDE8DE]'
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
