import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Scale,
  RotateCcw
} from 'lucide-react';
import { GraphNodeData, GraphEdgeData } from '../../../types/graph3d';
import { NODE_CONFIG } from '../Scene3D';

interface RightDossierPanelProps {
  node: GraphNodeData | null;
  onClose: () => void;
  onOpenSection91Notice: (node: GraphNodeData) => void;
  onResetOverview?: () => void;
  onHopToNode?: (nodeId: string) => void;
  connectedEdges?: GraphEdgeData[];
  allNodes?: GraphNodeData[];
}

export const RightDossierPanel: React.FC<RightDossierPanelProps> = ({
  node,
  onClose,
  onOpenSection91Notice,
  onResetOverview,
  onHopToNode,
  connectedEdges,
  allNodes,
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
      const addrSafe = (node.address || '').slice(0, 8) || '0x000000';
      const labelSafe = node.label || 'Target Node';
      const riskSafe = typeof node.riskScore === 'number' && isFinite(node.riskScore) ? node.riskScore : 50;
      setMessages([
        {
          role: 'assistant',
          text: `Evidentiary dossier loaded for ${labelSafe} (${addrSafe}...). FIFO taint velocity rating: ${riskSafe}%. What would you like to investigate?`,
        },
      ]);
    }
  }, [node?.id]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const nodeConnectedEdges = useMemo(() => {
    if (!node || !connectedEdges) return [];
    return connectedEdges.filter((e) => e.source === node.id || e.target === node.id);
  }, [node?.id, connectedEdges]);

  if (!node) return null;

  const nodeType = (node.type || 'INTERMEDIATE').toUpperCase() as keyof typeof NODE_CONFIG;
  const cfg = NODE_CONFIG[nodeType] || NODE_CONFIG['INTERMEDIATE'] || {
    color: '#38bdf8',
    glowColor: '#0284c7',
    label: 'Target Wallet',
    radius: 0.6,
  };
  const rawAddr = node.address || '0x0000000000000000000000000000000000000000';
  const truncatedAddr = rawAddr.length > 18 ? `${rawAddr.slice(0, 10)}...${rawAddr.slice(-8)}` : rawAddr;
  const nodeLabel = node.label || truncatedAddr;
  const nodeRiskScore = typeof node.riskScore === 'number' && isFinite(node.riskScore) ? Math.min(100, Math.max(0, node.riskScore)) : 50;
  const nodeBalance = node.balance || '0.00 ETH';
  const nodeBalanceUsd = typeof node.balanceUsd === 'number' && isFinite(node.balanceUsd) ? node.balanceUsd : 0;

  const handleCopy = () => {
    if (rawAddr) {
      navigator.clipboard.writeText(rawAddr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      const lower = textToSend.toLowerCase();
      const addrShort = rawAddr.length > 10 ? `${rawAddr.slice(0, 6)}...${rawAddr.slice(-4)}` : rawAddr;

      if (lower.includes('section 91') || lower.includes('notice') || lower.includes('freeze')) {
        reply = `Statutory Section 91 Cr.P.C. / Sec 94 BNSS requisition generated for ${rawAddr}. Immediate administrative debit freeze requisition issued to VASP compliance for destination exit 0x28C6...3d60.`;
        onOpenSection91Notice(node);
      } else if (lower.includes('taint') || lower.includes('flow') || lower.includes('peel')) {
        reply = `Wallet ${addrShort} received ${nodeBalance} originating from 0x4838...5f97 (Fraud Origin). Funds were layered across 0x7a25...488D (Peel Chain 1) and 0xdAC1...1ec7 (Peel Chain 2) before terminal exchange exit.`;
      } else if (lower.includes('where') || lower.includes('exit') || lower.includes('destination') || lower.includes('binance') || lower.includes('exchange')) {
        reply = `Downstream fund flow resolves to destination VASP deposits: 0x28C6...3d60 (Binance Hot Wallet 14) and 0x21a3...5549 (Binance Hot Wallet 2). Click any wallet address to focus it in the graph.`;
      } else if (lower.includes('mixer') || lower.includes('privacy') || lower.includes('tornado') || lower.includes('railgun')) {
        reply = `Privacy mixing protocols detected: Funds were partitioned into 0x6B17...1d0F (Tornado Cash Pool) and 0xD4e9...E2a9 (Railgun Relayer) to obscure forensic graph heuristics.`;
      } else if (lower.includes('sponsor') || lower.includes('gas') || lower.includes('fund')) {
        reply = `Gas sponsorship for the root siphon was provided by 0xA0b8...eB48 (Gas Sponsor) via pre-funded relay transfers.`;
      } else {
        reply = `Forensic dossier for ${nodeLabel} (${addrShort}): Active on-chain balance ${nodeBalance} (${nodeRiskScore}% risk rating). Upstream origin: 0x4838...5f97. Downstream off-ramps: 0x28C6...3d60 and 0x21a3...5549. Click any highlighted wallet address to navigate directly in the graph.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 900);
  };

  // Render clickable wallet chips inside chat messages
  const renderFormattedMessage = (text: string) => {
    const tokenRegex = /(0x[a-fA-F0-9]{3,8}\.{2,3}[a-fA-F0-9]{3,8}|0x[a-fA-F0-9]{40}|\[wallet:[^\]]+\])/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      let query = part;
      if (part.startsWith('[wallet:') && part.endsWith(']')) {
        query = part.slice(8, -1);
      }

      const matchedNode = allNodes?.find((n) => {
        const lowerAddr = n.address.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerAddr === lowerQuery) return true;
        if (n.id.toLowerCase() === lowerQuery) return true;
        if (n.label.toLowerCase() === lowerQuery) return true;

        if (query.includes('...')) {
          const [prefix, suffix] = query.split(/\.{2,3}/);
          if (prefix && suffix) {
            return lowerAddr.startsWith(prefix.toLowerCase()) && lowerAddr.endsWith(suffix.toLowerCase());
          }
        }
        return false;
      });

      if (matchedNode && onHopToNode) {
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHopToNode(matchedNode.id);
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 my-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono text-[10px] font-bold transition cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.25)] align-baseline group"
            title={`Click to focus and inspect ${matchedNode.label} (${matchedNode.address}) in graph`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse group-hover:scale-125 transition-transform" />
            <span>{part.startsWith('[wallet:') ? matchedNode.label : part}</span>
            <ExternalLink className="w-2.5 h-2.5 text-cyan-400 opacity-90 group-hover:translate-x-0.5 transition-transform" />
          </button>
        );
      }

      if (/^0x[a-fA-F0-9]{3,8}\.{2,3}[a-fA-F0-9]{3,8}$/.test(part) || /^0x[a-fA-F0-9]{40}$/.test(part)) {
        return (
          <span key={idx} className="font-mono text-cyan-300 font-semibold px-1 py-0.2 rounded bg-slate-900 border border-white/10 text-[10px]">
            {part}
          </span>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  // Risk Score Color Calculation:
  // green < 40, yellow < 70, orange < 85, red >= 85
  const getRiskColor = (score: number) => {
    if (score >= 85) return '#ef4444'; // Red
    if (score >= 70) return '#f97316'; // Orange
    if (score >= 40) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const riskColor = getRiskColor(nodeRiskScore);
  const strokeDash = (nodeRiskScore / 100) * (2 * Math.PI * 22);

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

            <div className="flex items-center gap-1.5">
              {onResetOverview && (
                <button
                  onClick={() => {
                    onClose();
                    onResetOverview();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-cyan-300 font-mono text-[10px] flex items-center gap-1 transition cursor-pointer"
                  title="Return to initial graph overview (Esc)"
                >
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Overview</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Dossier"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white font-sans">
                {nodeLabel}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-400">
                <span className="truncate max-w-[170px]" title={rawAddr}>{truncatedAddr}</span>
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
                  {nodeRiskScore}
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
              {nodeBalance}
            </div>
            {nodeBalanceUsd > 0 && (
              <div className="text-xs font-mono text-slate-400">
                ≈ ${nodeBalanceUsd.toLocaleString()} USD
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

          {/* Connected Transaction Hops (Direct Traversal) */}
          {nodeConnectedEdges.length > 0 && onHopToNode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Connected Wallet Hops (Click to Jump)
                </span>
                <span className="text-[8.5px] font-mono text-slate-500">
                  {nodeConnectedEdges.length} Link{nodeConnectedEdges.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-1.5">
                {nodeConnectedEdges.map((e) => {
                  const isOutflow = e.source === node.id;
                  const partnerId = isOutflow ? e.target : e.source;
                  const partnerNode = allNodes?.find((n) => n.id === partnerId);
                  const partnerLabel = partnerNode?.label || partnerId;

                  return (
                    <button
                      key={e.id}
                      onClick={() => onHopToNode(partnerId)}
                      className="w-full p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/95 border border-white/10 hover:border-cyan-400/50 flex items-center justify-between text-left transition cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold shrink-0 ${
                            isOutflow
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isOutflow ? '➔ OUTFLOW' : '⬅ INFLOW'}
                        </span>
                        <div className="truncate">
                          <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate font-sans">
                            {partnerLabel}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400">
                            {e.taintAmount} ETH · Hop {e.hopIndex}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5 ml-2">
                        Hop ➔
                      </span>
                    </button>
                  );
                })}
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
                {renderFormattedMessage(m.text)}
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

export { RightDossierPanel as RightDossierPanel3D };
