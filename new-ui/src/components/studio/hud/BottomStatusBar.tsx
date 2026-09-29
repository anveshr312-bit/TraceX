import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface BottomStatusBarProps {
  networkName?: string;
  nodeCount: number;
  hopCount?: number;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  networkName = 'Ethereum Mainnet',
  nodeCount = 0,
  hopCount = 4,
}) => {
  return (
    <footer className="h-9 w-full px-5 flex items-center justify-between select-none
      bg-[#161418]/95 backdrop-blur-md border-t border-[#2E2B32] z-30 pointer-events-auto
      text-[11px] font-mono text-[#7E7972]">

      {/* Left: Network */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
        <span className="text-[#A8A399]">{networkName}</span>
        <span className="text-[#2E2B32]">·</span>
        <span className="text-[#4A7C59]">Connected</span>
      </div>

      {/* Center: Stats */}
      <div className="hidden sm:flex items-center gap-3 text-[#7E7972]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#B8935F]" />
          <span>{hopCount} hops</span>
        </div>
        <span className="text-[#252229]">|</span>
        <span><strong className="text-[#A8A399]">{nodeCount}</strong> wallets resolved</span>
      </div>

      {/* Right: Integrity */}
      <div className="flex items-center gap-1.5 text-[#4A7C59]">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Evidence integrity: SHA-256 ✓</span>
      </div>
    </footer>
  );
};
