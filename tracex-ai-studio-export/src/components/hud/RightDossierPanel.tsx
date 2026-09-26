import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileCheck, 
  ArrowUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  Scale
} from 'lucide-react';
import { GraphNodeData } from '../../types/graph3d';
import { NODE_CONFIG } from '../Scene3D';

interface RightDossierPanelProps {
  node: GraphNodeData | null;
  onClose: () => void;
  onOpenSection91Notice: (node: GraphNodeData) => void;
}

export const RightDossierPanel: React.FC<RightDossierPanelProps> = ({
  node,
  onClose,
  onOpenSection91Notice,
}) => {
  const [copied, setCopied] = useState(false);
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset messages when node changes
    if (node) {
      setMessages([
        {
          role: 'assistant',
          text: `Evidentiary dossier loaded for ${node.label} (${node.address.slice(0, 8)}...). FIFO taint velocity rating: ${node.riskScore}%. What would you like to investigate?`,
        },
      ]);
    }
  }, [node?.id]);

  if (!node) return null;

  const cfg = NODE_CONFIG[node.type];
  const truncatedAddr = `${node.address.slice(0, 10)}...${node.address.slice(-8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (evidenceId: string) => {
    setVerifiedMap((prev) => ({ ...prev, [evidenceId]: true }));
  };

  const handleSendChat = (presetText?: string) => {
    const textToSend = presetText || chatInput.trim();
    if (!textToSend || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    if (!presetText) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      if (textToSend.toLowerCase().includes('section 91') || textToSend.toLowerCase().includes('notice') || textToSend.toLowerCase().includes('freeze')) {
        reply = `Statutory Section 91 Cr.P.C. / Sec 94 BNSS requisition generated for ${node.address}. Recommended: Immediate 2-hour administrative debit freeze directive to VASP compliance liaison.`;
        onOpenSection91Notice(node);
      } else if (textToSend.toLowerCase().includes('taint') || textToSend.toLowerCase().includes('flow')) {
        reply = `Wallet ${node.address.slice(0, 6)}...${node.address.slice(-4)} received ${node.balance} originating from the root fraud contract. FIFO taint ledger attributes 100% of subsequent splits to illicit conversion without legitimate underlying trade counterparty.`;
      } else {
        reply = `Wallet ${node.address.slice(0, 6)}...${node.address.slice(-4)} received ${node.balance} from a known phishing contract deployed at block 18,233,998. FIFO taint analysis attributes 100% of outbound transfers to illicit origin. This wallet has been flagged by Chainalysis and appears on the OFAC SDN list (added 2024-03-15). Recommended action: Issue Section 91 CrPC notice to Binance for KYC disclosure on destination wallets 0x28C6...3d60 and 0x21a3...5549.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1800);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Risk Score Color Calculation:
  // green < 40, yellow < 70, orange < 85, red >= 85
  const getRiskColor = (score: number) => {
    if (score >= 85) return '#ef4444'; // Red
    if (score >= 70) return '#f97316'; // Orange
    if (score >= 40) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const riskColor = getRiskColor(node.riskScore);
  const strokeDash = (node.riskScore / 100) * (2 * Math.PI * 22);

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="w-96 lg:w-[410px] h-full backdrop-blur-xl bg-slate-950/80 border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl select-none pointer-events-auto z-30"
      >
        {/* Dossier Header */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold tracking-wider uppercase border shadow-sm"
              style={{
                backgroundColor: `${cfg.color}15`,
                color: cfg.color,
                borderColor: `${cfg.color}40`,
              }}
            >
              ● {cfg.label}
            </span>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white font-sans">
                {node.label}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-400">
                <span className="truncate max-w-[170px]">{node.address}</span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy Full Address"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Circular Risk Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-slate-800"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke={riskColor}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 - strokeDash}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-mono font-bold" style={{ color: riskColor }}>
                  {node.riskScore}
                </span>
                <span className="text-[7.5px] font-mono text-slate-500 uppercase">RISK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dossier Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Balance */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
            <div className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">
              Identified On-Chain Balance
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {node.balance}
            </div>
            {node.balanceUsd > 0 && (
              <div className="text-xs font-mono text-slate-400">
                ≈ ${node.balanceUsd.toLocaleString()} USD
              </div>
            )}
          </div>

          {/* Labels & Tags */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Investigative Signatures & Flags
              </span>
              <div className="flex flex-wrap gap-1">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-white/10 text-[10px] font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History Mini-Table */}
          {node.txHistory && node.txHistory.length > 0 && (
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                On-Chain Inflow / Outflow Ledger
              </span>
              <div className="rounded-xl border border-white/5 overflow-hidden font-mono text-[10px] bg-slate-900/40">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="py-1.5 px-2 font-normal">Dir</th>
                      <th className="py-1.5 px-2 font-normal">Amount</th>
                      <th className="py-1.5 px-2 font-normal">Counterparty</th>
                      <th className="py-1.5 px-2 font-normal">Block</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {node.txHistory.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-2">
                          <span
                            className={`px-1 py-0.2 rounded font-bold text-[9px] ${
                              tx.direction === 'IN'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {tx.direction}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-white font-medium">{tx.amount}</td>
                        <td className="py-1.5 px-2 text-slate-400">{tx.counterparty}</td>
                        <td className="py-1.5 px-2 text-cyan-400">{tx.block}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Evidence Chain */}
          {node.evidenceIds && node.evidenceIds.length > 0 && (
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Cryptographic Evidence Chain
              </span>
              <div className="space-y-1.5 font-mono text-[10.5px]">
                {node.evidenceIds.map((evId) => {
                  const isVerified = verifiedMap[evId];

                  return (
                    <div
                      key={evId}
                      className="p-2 rounded-lg bg-slate-900/70 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-white font-semibold">{evId}</span>
                        <span className="px-1 py-0.2 rounded text-[8.5px] bg-slate-800 text-slate-400 border border-white/5">
                          SHA-256
                        </span>
                      </div>

                      <button
                        onClick={() => handleVerify(evId)}
                        disabled={isVerified}
                        className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer flex items-center gap-1 ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <span>Verify</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statutory Action Button */}
          <button
            onClick={() => onOpenSection91Notice(node)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.35)] transition cursor-pointer"
          >
            <Scale className="w-4 h-4 stroke-[2.2]" />
            <span>Generate Statutory Section 91 Notice</span>
          </button>
        </div>

        {/* Footer — Copilot Chat Bar */}
        <div className="p-3 border-t border-white/10 bg-slate-950 space-y-2">
          {/* Quick-Ask Pills */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => handleSendChat('Is this wallet linked to known fraud?')}
              className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition cursor-pointer truncate max-w-full"
            >
              Is this linked to known fraud?
            </button>
            <button
              onClick={() => handleSendChat('Explain the taint flow through this node')}
              className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-400/20 transition cursor-pointer"
            >
              Explain taint flow
            </button>
            <button
              onClick={() => handleSendChat('Generate Section 91 CrPC notice')}
              className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/20 transition cursor-pointer"
            >
              Generate Sec 91 Notice
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={chatScrollRef} className="max-h-28 overflow-y-auto space-y-1.5 text-xs font-sans">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg leading-relaxed text-[11px] ${
                  m.role === 'user'
                    ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-100 ml-4 font-mono'
                    : 'bg-slate-900/80 border border-white/5 text-slate-300 mr-2'
                }`}
              >
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-1.5 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about this wallet..."
              className="w-full h-8 pl-3 pr-8 rounded-full bg-slate-900 border border-white/10 focus:border-cyan-400 focus:outline-none text-[11px] font-mono text-white placeholder:text-slate-500 transition"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={isTyping || !chatInput.trim()}
              className="absolute right-1 w-6 h-6 rounded-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 flex items-center justify-center transition cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
