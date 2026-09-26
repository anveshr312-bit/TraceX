import React from 'react';
import { ForensicFinding } from '../types/forensics';
import { ArrowRight } from 'lucide-react';

interface FindingListProps {
  findings: ForensicFinding[];
  activeFinding: ForensicFinding | null;
  onFocusFinding: (findingId: string) => void;
  onViewEvidence: (evidenceRef: string) => void;
}

export const FindingList: React.FC<FindingListProps> = ({
  findings,
  activeFinding,
  onFocusFinding,
  onViewEvidence,
}) => {
  return (
    <div className="space-y-4">
      {findings.map((f, idx) => {
        const isSelected = activeFinding?.id === f.id;

        return (
          <div
            key={f.id}
            className={`pb-4 border-b border-[#14161C] transition ${
              isSelected ? 'opacity-100' : 'opacity-85 hover:opacity-100'
            }`}
          >
            {/* Header: Code + Severity */}
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className={`font-semibold ${
                f.severity === 'CRITICAL' ? 'text-[#DC2626]' : f.severity === 'HIGH' ? 'text-[#D97706]' : 'text-[#8E8B83]'
              }`}>
                {f.code}
              </span>
              <span className="text-[#555861] uppercase">
                {f.severity}
              </span>
            </div>

            {/* Title */}
            <div className="text-xs font-semibold text-[#EEEBE2] mt-1 tracking-tight">
              {f.title}
            </div>

            {/* Metric Summary */}
            <div className="font-mono text-[11px] text-[#A09D95] mt-0.5">
              {f.metricsSummary}
            </div>

            {/* Explanation */}
            <p className="text-[11px] text-[#71747E] mt-1.5 leading-relaxed font-sans">
              {f.description}
            </p>

            {/* Actions: Evidence Reference + Focus */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
              <button
                onClick={() => onViewEvidence(f.evidenceRef)}
                className="text-[#555861] hover:text-[#A09D95] transition cursor-pointer"
              >
                {f.evidenceRef}
              </button>

              <button
                onClick={() => onFocusFinding(f.id)}
                className="flex items-center gap-1 text-[#D97706] hover:text-[#F59E0B] transition cursor-pointer"
              >
                <span>Focus</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
