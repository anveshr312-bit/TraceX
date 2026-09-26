import React, { useState } from 'react';
import { X, Copy, Check, Filter } from 'lucide-react';
import { EvidenceRecord } from '../../types/forensics';
import { EVIDENCE_RECORDS } from '../../data/dossierFixture';

interface EvidencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvidenceId: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  isOpen,
  onClose,
  selectedEvidenceId,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string | null>(selectedEvidenceId);

  React.useEffect(() => {
    setFilterId(selectedEvidenceId);
  }, [selectedEvidenceId]);

  if (!isOpen) return null;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const recordsToDisplay = filterId
    ? EVIDENCE_RECORDS.filter(r => r.evidenceId === filterId)
    : EVIDENCE_RECORDS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none text-xs">
      <div className="w-full max-w-2xl rounded bg-[#0A0B0F] border border-[#1C1F28] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="h-11 px-4 border-b border-[#16181E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#EEEBE2] font-medium text-[11px] tracking-tight">
              FORENSIC EVIDENCE DOCKET
            </span>
            {filterId && (
              <span className="text-[10px] font-mono text-[#4D88FF] px-1.5 py-0.2 rounded bg-[#131720] border border-[#232A3B]">
                {filterId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filterId && (
              <button
                onClick={() => setFilterId(null)}
                className="text-[10px] font-mono text-[#71747E] hover:text-[#EEEBE2] transition cursor-pointer"
              >
                Show All Records
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#60636C] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
          {recordsToDisplay.map((rec) => (
            <div
              key={rec.evidenceId}
              className="p-3.5 rounded bg-[#0E1015] border border-[#191D26] space-y-2.5"
            >
              {/* Evidence ID + Block Height + Timestamp */}
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-[#4D88FF] font-semibold">{rec.evidenceId}</span>
                <span className="text-[#60636C]">
                  Block #{rec.blockNumber} • {rec.timestamp}
                </span>
              </div>

              {/* Transaction Hash */}
              <div>
                <div className="text-[9px] uppercase text-[#555861] tracking-wider">
                  Transaction Hash
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5 p-1.5 rounded bg-[#090A0D] border border-[#14161C] text-[10px] text-[#A09D95]">
                  <span className="truncate">{rec.transactionHash}</span>
                  <button
                    onClick={() => handleCopy(rec.transactionHash)}
                    className="text-[#60636C] hover:text-[#EEEBE2] transition flex-shrink-0"
                    title="Copy hash"
                  >
                    {copiedHash === rec.transactionHash ? (
                      <Check className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Source & Target */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="text-[9px] uppercase text-[#555861]">Source Address</div>
                  <div className="text-[#CFCBC0] truncate mt-0.5">{rec.sourceAddress}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-[#555861]">Target Address</div>
                  <div className="text-[#CFCBC0] truncate mt-0.5">{rec.targetAddress}</div>
                </div>
              </div>

              {/* Taint Quantum & Classification */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#16181E] text-[10.5px]">
                <div>
                  <div className="text-[9px] uppercase text-[#555861]">Taint Quantum</div>
                  <div className="text-[#D97706] font-semibold mt-0.5">
                    {rec.taintAmountEth} ETH
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-[#555861]">Taint Ratio</div>
                  <div className="text-[#A09D95] mt-0.5">{rec.taintRatio}%</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase text-[#555861]">Entity Type</div>
                  <div className="text-[#EEEBE2] mt-0.5">{rec.entityType}</div>
                </div>
              </div>

              {/* Analytical Notes */}
              <div className="pt-2 border-t border-[#16181E] text-[10px] text-[#71747E] font-sans leading-relaxed">
                {rec.notes}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-10 px-4 border-t border-[#16181E] flex items-center justify-between font-mono text-[10px] text-[#60636C]">
          <span>{recordsToDisplay.length} Evidence Artifacts Logged</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#13161E] hover:bg-[#1A1D27] text-[#EEEBE2] text-xs font-medium border border-[#202532] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
