import React, { useState } from 'react';
import { X, Plus, Search, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrace: (txHash: string, firNumber: string, chain: string) => void;
}

export const NewInvestigationModal: React.FC<NewInvestigationModalProps> = ({
  isOpen,
  onClose,
  onStartTrace,
}) => {
  const [txHash, setTxHash] = useState('0x4a8b79e2a8712bf3901928401928401928401928401928401928401928401928');
  const [firNumber, setFirNumber] = useState('FIR No. 402/2026 Special Cell');
  const [chain, setChain] = useState('Ethereum Mainnet');
  const [isTracing, setIsTracing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracing(true);
    setTimeout(() => {
      setIsTracing(false);
      onStartTrace(txHash, firNumber, chain);
      onClose();
    }, 700);
  };

  const samplePresets = [
    {
      name: 'Aegis Protocol Treasury Drain (14.85 ETH)',
      hash: '0x4a8b79e2a8712bf3901928401928401928401928401928401928401928401928',
      fir: 'FIR No. 402/2026 Special Cell',
      chain: 'Ethereum Mainnet',
    },
    {
      name: 'Orbit Bridge Flash Siphon (1,420 ETH)',
      hash: '0x202b918239018240918204981204981204981204981204981204981204981204',
      fir: 'FIR No. 112/2026 Special Cell',
      chain: 'Ethereum Mainnet',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#0E1015] border border-white/10 shadow-2xl overflow-hidden text-xs font-mono">
        {/* Modal Top Bar */}
        <div className="h-12 px-5 border-b border-white/10 flex items-center justify-between bg-[#08090C]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] flex items-center justify-center text-black font-bold">
              +
            </div>
            <span className="font-sans font-bold text-[#EEEBE2] text-sm tracking-tight">
              Initiate On-Chain Forensic Trace
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#71747E] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] text-[#8E8B83] uppercase tracking-wider block mb-1.5">
              Root Transaction Hash / Exploit Tx
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              required
              className="w-full h-9 px-3 rounded-lg bg-[#141720] border border-white/10 focus:border-[#00F2FE] focus:outline-none text-xs text-[#EEEBE2] font-mono transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#8E8B83] uppercase tracking-wider block mb-1.5">
                FIR / Case Reference
              </label>
              <input
                type="text"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                placeholder="FIR No. ..."
                required
                className="w-full h-9 px-3 rounded-lg bg-[#141720] border border-white/10 focus:border-[#00F2FE] focus:outline-none text-xs text-[#EEEBE2] font-mono transition"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8E8B83] uppercase tracking-wider block mb-1.5">
                Blockchain Network
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#141720] border border-white/10 focus:border-[#00F2FE] focus:outline-none text-xs text-[#EEEBE2] font-mono transition cursor-pointer"
              >
                <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                <option value="Polygon POS">Polygon POS</option>
                <option value="Arbitrum One">Arbitrum One</option>
                <option value="BNB Smart Chain">BNB Smart Chain</option>
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2">
            <span className="text-[9px] text-[#555861] uppercase tracking-wider block mb-1.5">
              Select Preset Cyber Investigation
            </span>
            <div className="space-y-1.5">
              {samplePresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setTxHash(preset.hash);
                    setFirNumber(preset.fir);
                    setChain(preset.chain);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-[#161A24] border border-white/5 transition flex items-center justify-between text-[11px] cursor-pointer"
                >
                  <div>
                    <div className="text-[#EEEBE2] font-sans font-medium">{preset.name}</div>
                    <div className="text-[9.5px] text-[#71747E] font-mono">{preset.fir}</div>
                  </div>
                  <span className="text-[#00F2FE] text-[10px]">Load Preset →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs text-[#8E8B83] hover:text-[#EEEBE2] hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTracing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] text-black font-semibold text-xs transition cursor-pointer"
            >
              {isTracing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Computing Lineage...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Deploy Recursive Trace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
