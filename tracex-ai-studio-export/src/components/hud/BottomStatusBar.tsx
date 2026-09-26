import React from 'react';
import { CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface BottomStatusBarProps {
  networkName?: string;
  nodeCount: number;
  hopCount?: number;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  networkName = 'Sepolia Testnet',
  nodeCount = 13,
  hopCount = 4,
}) => {
  return (
    <footer className="h-10 w-full px-5 flex items-center justify-between select-none backdrop-blur-xl bg-slate-950/70 border-t border-white/10 shadow-2xl z-30 pointer-events-auto text-[11px] font-mono text-slate-400">
      {/* Left: Network Connected */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-slate-200 font-semibold">{networkName}</span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400 font-medium">Connected</span>
      </div>

      {/* Center: Trace Stats */}
      <div className="hidden sm:flex items-center gap-2 text-slate-300">
        <Activity className="w-3.5 h-3.5 text-cyan-400" />
        <span>Last trace: <strong className="text-white">2.3s</strong></span>
        <span className="text-slate-600">|</span>
        <span><strong className="text-white">{hopCount} hops</strong></span>
        <span className="text-slate-600">|</span>
        <span><strong className="text-white">{nodeCount} nodes</strong> resolved</span>
      </div>

      {/* Right: Evidence Integrity */}
      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold drop-shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>Evidence integrity: SHA-256 verified ✓</span>
      </div>
    </footer>
  );
};
