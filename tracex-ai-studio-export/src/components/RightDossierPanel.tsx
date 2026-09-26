import React, { useState, useRef, useEffect } from 'react';
import { 
  TerminalEntityNode, 
  ForensicCase, 
  CopilotMessage, 
  CopilotCitation 
} from '../types/forensics';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Scale, 
  Zap, 
  Search, 
  ChevronRight,
  AlertCircle,
  FileText,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface RightDossierPanelProps {
  node: TerminalEntityNode;
  currentCase: ForensicCase;
  onOpenSection91: (node: TerminalEntityNode) => void;
  onViewEvidence: (evidenceId?: string) => void;
  onFocusCitation: (citation: CopilotCitation) => void;
}

export const RightDossierPanel: React.FC<RightDossierPanelProps> = ({
  node,
  currentCase,
  onOpenSection91,
  onViewEvidence,
  onFocusCitation,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      text: `Traced ${node.amountEth} ETH (${node.amountInr}) inbound to ${node.name} across ${node.hops} hops from Fraud Root [tx:0x4a8b...]. Pattern shows high-velocity peel-chain structuring terminating in KYC exchange deposit infrastructure.`,
      timestamp: 'Just now',
      citations: [
        { type: 'transaction', id: currentCase.rootAnchor.txHash, label: 'tx:0x4a8b...' },
        { type: 'wallet', id: node.id, label: node.name },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = (textToSend?: string) => {
    const q = textToSend || inputQuestion.trim();
    if (!q) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuestion('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let replyCitations: CopilotCitation[] = [];

      const lowerQ = q.toLowerCase();
      if (lowerQ.includes('peel') || lowerQ.includes('highlight')) {
        replyText = `Detected 4 sub-tranche peel mules originating from Fraud Root [tx:0x4a8b...]. Assets split into 2.40 ETH and 1.85 ETH batches with dwell times < 45 seconds before terminal deposit into [wallet:Binance Hot Wallet 14].`;
        replyCitations = [
          { type: 'transaction', id: currentCase.rootAnchor.txHash, label: 'tx:0x4a8b...' },
          { type: 'category', id: 'peel', label: 'Peel Chains' },
          { type: 'wallet', id: 'term-vasp-binance', label: 'Binance Hot Wallet 14' },
        ];
      } else if (lowerQ.includes('legal') || lowerQ.includes('summary') || lowerQ.includes('statutory')) {
        replyText = `Statutory Summary for FIR ${currentCase.firNumber}: Assets represent tainted proceeds under BNS Sec 318(4) and IT Act Sec 66D. Requisition under Section 91 Cr.P.C. / Sec 94 BNSS mandates 2-hour administrative debit-freeze on deposit address ${node.address.slice(0, 10)}...`;
        replyCitations = [
          { type: 'evidence', id: node.evidenceId, label: node.evidenceId },
          { type: 'wallet', id: node.id, label: node.name },
        ];
      } else if (lowerQ.includes('agent') || lowerQ.includes('status')) {
        replyText = `Forensic Agent Status: Active autonomous watch on 8 Ethereum mempool relayers. Cross-matched against 3 concurrent cyber crime complaints in New Delhi Cyber Command database.`;
        replyCitations = [
          { type: 'finding', id: 'R8', label: 'RULE-08 VASP Exit' },
        ];
      } else {
        replyText = `Analysis of ${node.name} (${node.badgeTier}): Received ${node.amountEth} ETH through multi-hop peel transit. Risk rating stands at ${node.riskRating}% due to rapid transit velocity and lack of legitimate counterparty commerce.`;
        replyCitations = [
          { type: 'wallet', id: node.id, label: node.name },
          { type: 'evidence', id: node.evidenceId, label: 'Evidence Docket' },
        ];
      }

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: 'Just now',
        citations: replyCitations,
      };

      setCopilotMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [copilotMessages, isTyping]);

  return (
    <aside className="w-96 md:w-[410px] h-full bg-[#101217]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl z-20 select-none">
      {/* SCROLLABLE TOP SECTION: DOSSIER PARTICULARS */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 1. Header: Entity Emblem + Title + Active Badge + Explore Full Dossier */}
        <div className="pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Emblem */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B]/30 to-[#8B5CF6]/30 border border-[#F59E0B]/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                ● ACTIVE TARGET
              </span>
            </div>

            <button
              onClick={() => onViewEvidence(node.evidenceId)}
              className="flex items-center gap-1 text-[11px] font-mono text-[#00F2FE] hover:text-white transition cursor-pointer"
            >
              <span>Explore Full Dossier</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <h2 className="font-sans font-bold text-base text-[#EEEBE2] mt-2.5 leading-snug">
            {node.name}
            <span className="text-xs text-[#8E8B83] font-normal block font-mono mt-0.5">
              ({node.subtitle || 'Centralized VASP Exit'})
            </span>
          </h2>

          <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-[#71747E] bg-black/40 p-1.5 rounded-lg border border-white/5">
            <span className="truncate flex-1">{node.address}</span>
            <button
              onClick={handleCopy}
              className="text-[#8E8B83] hover:text-[#EEEBE2] transition cursor-pointer shrink-0"
              title="Copy Address"
            >
              {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 2. Primary Risk Metric: Large KPI + Animated Equalizer Bar */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#161922] to-[#0D0F14] border border-[#F59E0B]/30 shadow-inner">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-mono text-[#8E8B83] uppercase tracking-wider">
              Primary Risk Score
            </span>
            <span className="text-[10px] font-mono text-[#F59E0B] font-semibold">
              HEURISTIC ENGINE
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#EEEBE2]">
              Risk Rating:
            </span>
            <span className="text-2xl font-extrabold font-mono text-[#EF4444] drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
              {node.riskRating}% {node.riskSeverity}
            </span>
          </div>

          {/* Animated Sparkline / Equalizer Wave */}
          <div className="flex items-end gap-1 h-6 mt-3 pt-1 border-t border-white/5">
            {[45, 78, 62, 94, 88, 70, 92, 98, 85, 90, 76, 94, 82, 88, 95, 89, 93, 72, 88, 96].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-[#F59E0B]/40 to-[#EF4444] rounded-t-sm"
                style={{
                  height: `${h}%`,
                  opacity: i > 14 ? 0.95 : 0.75,
                }}
              />
            ))}
          </div>
        </div>

        {/* 3. 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="text-[9px] text-[#71747E] uppercase tracking-wider">Tainted Inflow</div>
            <div className="text-sm font-bold text-[#EEEBE2] mt-1">
              {node.amountEth} ETH
            </div>
            <div className="text-[10px] text-[#F59E0B]">{node.amountInr}</div>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="text-[9px] text-[#71747E] uppercase tracking-wider">Traversal Depth</div>
            <div className="text-sm font-bold text-[#EEEBE2] mt-1">
              {node.hops} Hops
            </div>
            <div className="text-[10px] text-[#8E8B83]">Rapid Passthrough</div>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="text-[9px] text-[#71747E] uppercase tracking-wider">Cross-FIR Matches</div>
            <div className="text-sm font-bold text-[#EF4444] mt-1">
              {node.flaggedFirsCount} Flagged FIRs
            </div>
            <div className="text-[10px] text-[#8E8B83]">I4C National Grid</div>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="text-[9px] text-[#71747E] uppercase tracking-wider">VASP Classification</div>
            <div className="text-sm font-bold text-[#10B981] mt-1">
              {node.badgeTier}
            </div>
            <div className="text-[10px] text-[#8E8B83] truncate">
              {node.vaspRegistration || 'FIU-IND Registered'}
            </div>
          </div>
        </div>

        {/* 4. Forensic Pattern Analysis Box */}
        <div className="p-3.5 rounded-xl bg-[#0B0D11] border border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00F2FE]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Forensic Pattern Analysis</span>
          </div>

          <p className="font-sans text-xs text-[#D8D4C8] leading-relaxed">
            "{node.patternAnalysisNote}"
          </p>

          <div className="flex flex-wrap gap-1 pt-1 font-mono text-[9px]">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-white/5 text-[#A09D95] border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Action Button: Generate Section 91 Freeze Draft */}
        <button
          onClick={() => onOpenSection91(node)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#F59E0B] hover:to-[#B45309] text-black font-semibold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <Scale className="w-4 h-4 stroke-[2.2]" />
          <span className="font-sans tracking-tight">Generate Section 91 Freeze Draft</span>
        </button>
      </div>

      {/* 6. FLOATING INTEGRATED AI COPILOT CHAT BAR (BOTTOM OF RIGHT PANEL) */}
      <div className="border-t border-white/10 bg-[#0A0C10] p-3.5 flex flex-col space-y-2.5 shadow-2xl">
        {/* Dynamic Chat Messages Thread */}
        <div 
          ref={chatScrollRef}
          className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs font-mono"
        >
          {copilotMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1C202B] text-white ml-6 border border-white/10'
                  : 'bg-black/40 text-[#D8D4C8] border border-white/5 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] text-[#71747E] mb-1">
                <span>{msg.role === 'user' ? 'INVESTIGATOR' : 'TRACEX COPILOT'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="text-[11px] font-sans">{msg.text}</p>

              {/* Clickable Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/5">
                  {msg.citations.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => onFocusCitation(c)}
                      className="px-1.5 py-0.5 rounded bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30 text-[9.5px] font-mono transition cursor-pointer flex items-center gap-1"
                    >
                      <span>[{c.label}]</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-[10px] text-[#71747E] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-ping" />
              <span>Analyzing on-chain lineage heuristics...</span>
            </div>
          )}
        </div>

        {/* Sleek Rounded Input Pill */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
            placeholder="Ask a question about this trace..."
            className="w-full h-8 pl-3 pr-8 rounded-full bg-[#141720] border border-white/10 focus:border-[#00F2FE] focus:outline-none text-xs text-[#EEEBE2] placeholder:text-[#60636C] font-mono transition"
          />
          <button
            onClick={() => handleSendQuestion()}
            className="absolute right-1.5 w-6 h-6 rounded-full bg-[#00F2FE] hover:bg-[#00d8e4] text-black flex items-center justify-center transition cursor-pointer"
          >
            <Send className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Quick Action Chips Below Input */}
        <div className="flex items-center gap-1.5 text-[9.5px] font-mono overflow-x-auto pb-0.5">
          <button
            onClick={() => handleSendQuestion('My Agent status and active mempool watchers')}
            className="px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#EEEBE2] border border-white/10 transition cursor-pointer whitespace-nowrap"
          >
            🔍 My Agent
          </button>
          <button
            onClick={() => handleSendQuestion('Highlight peel chain layering path')}
            className="px-2 py-1 rounded-full bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 transition cursor-pointer whitespace-nowrap"
          >
            ⚡ Highlight Peel Chain
          </button>
          <button
            onClick={() => handleSendQuestion('Statutory legal summary under Section 91 CrPC')}
            className="px-2 py-1 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 transition cursor-pointer whitespace-nowrap"
          >
            ⚖️ Legal Summary
          </button>
        </div>

        {/* Legal Guardrail Statutory Disclaimer */}
        <div className="pt-1 border-t border-white/5 text-[8.5px] font-mono text-[#555861] leading-tight">
          STATUTORY DISCLAIMER: TraceX AI provides forensic evidentiary heuristics under I4C standards. Final legal culpability determinations require formal evidentiary verification under BNSS.
        </div>
      </div>
    </aside>
  );
};
