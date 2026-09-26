import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface TimelineHop {
  hop: number;
  stageName: string;
  timestamp: string;
  block: string;
  volumeLabel: string;
}

const TIMELINE_HOPS: TimelineHop[] = [
  {
    hop: 0,
    stageName: 'Fraud Origin',
    timestamp: '12:14 UTC',
    block: '#20819440',
    volumeLabel: '840.0 ETH siphoned',
  },
  {
    hop: 1,
    stageName: 'Passthrough',
    timestamp: '12:15 UTC',
    block: '#20819443',
    volumeLabel: '839.8 ETH evacuated',
  },
  {
    hop: 2,
    stageName: 'Peel Splits',
    timestamp: '12:18 UTC',
    block: '#20819448',
    volumeLabel: '500 ETH peeled & fan-out',
  },
  {
    hop: 3,
    stageName: 'Mixer Ingress',
    timestamp: '13:15 UTC',
    block: '#20819495',
    volumeLabel: '180 ETH shielded',
  },
  {
    hop: 4,
    stageName: 'Exchange Exits',
    timestamp: '13:40 UTC',
    block: '#20819525',
    volumeLabel: '35.05 ETH custodial',
  },
];

interface InvestigationTimelineProps {
  currentHop: number;
  onChangeHop: (hop: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({
  currentHop,
  onChangeHop,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
}) => {
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 3000 / playbackSpeed;
    const timer = setInterval(() => {
      onChangeHop(currentHop >= 4 ? 0 : currentHop + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, onChangeHop, currentHop]);

  const activeStage = TIMELINE_HOPS[currentHop] || TIMELINE_HOPS[0];

  return (
    <div className="h-10 bg-[#07080A] border-t border-[#16181E] px-4 flex items-center justify-between text-xs select-none z-20">
      {/* Controls */}
      <div className="flex items-center gap-1 pr-4 border-r border-[#16181E]">
        <button
          onClick={() => onChangeHop(Math.max(0, currentHop - 1))}
          disabled={currentHop === 0}
          className="p-1 rounded text-[#60636C] hover:text-[#EEEBE2] disabled:opacity-20 transition cursor-pointer"
          title="Previous Hop"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-1 rounded text-[#EEEBE2] hover:bg-[#12151B] transition cursor-pointer"
          title={isPlaying ? "Pause Replay" : "Play Timeline Replay"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={() => onChangeHop(Math.min(4, currentHop + 1))}
          disabled={currentHop === 4}
          className="p-1 rounded text-[#60636C] hover:text-[#EEEBE2] disabled:opacity-20 transition cursor-pointer"
          title="Next Hop"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onChangeSpeed(playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 5 : 1)}
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#71747E] hover:text-[#EEEBE2] transition cursor-pointer"
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* Cinematic Timeline Track */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative flex items-center justify-between">
          {/* Subtle Hairline */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-px bg-[#181B22]" />

          {/* Active Fluid Progress Hairline */}
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-px bg-[#D97706] transition-all duration-300"
            style={{ width: `${(currentHop / 4) * 100}%` }}
          />

          {/* Timeline Hop Nodes */}
          {TIMELINE_HOPS.map((stage) => {
            const isReached = stage.hop <= currentHop;
            const isCurrent = stage.hop === currentHop;

            return (
              <div
                key={stage.hop}
                onClick={() => onChangeHop(stage.hop)}
                className="relative z-10 flex flex-col items-center cursor-pointer group py-1"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'w-2.5 h-2.5 bg-[#EEEBE2] ring-2 ring-[#D97706]/40'
                      : isReached
                      ? 'bg-[#D97706]'
                      : 'bg-[#21242E] group-hover:bg-[#343846]'
                  }`}
                />

                <span
                  className={`text-[9px] font-mono mt-1 transition ${
                    isCurrent
                      ? 'text-[#EEEBE2] font-medium'
                      : isReached
                      ? 'text-[#8E8B83]'
                      : 'text-[#484B54]'
                  }`}
                >
                  Hop {stage.hop}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Phase Metadata */}
      <div className="flex items-center gap-3 pl-4 border-l border-[#16181E] font-mono text-[10px] text-[#60636C]">
        <span className="text-[#EEEBE2] font-sans font-medium">{activeStage.stageName}</span>
        <span>{activeStage.timestamp}</span>
        <span className="hidden sm:inline">{activeStage.volumeLabel}</span>
      </div>
    </div>
  );
};
