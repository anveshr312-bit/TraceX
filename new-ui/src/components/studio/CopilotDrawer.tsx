import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { CopilotMessage } from '../../types/forensics';
import { GraphNodeData, GraphEdgeData } from '../../types/graph3d';

// ─── Real-data helpers ────────────────────────────────────────────────────────
const fmt = (addr: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : 'unknown';

function toEth(weiStr: string): number {
  try { return Number(BigInt(weiStr)) / 1e18; } catch { return 0; }
}

function getExits(nodes: GraphNodeData[]): GraphNodeData[] {
  return nodes.filter(n =>
    (n as any).hopIndex === 4 ||
    n.label?.toLowerCase().includes('binance') ||
    n.label?.toLowerCase().includes('kraken') ||
    n.label?.toLowerCase().includes('coinbase') ||
    n.label?.toLowerCase().includes('railgun') ||
    n.label?.toLowerCase().includes('exit')
  );
}

function getHighRisk(nodes: GraphNodeData[], top = 5): GraphNodeData[] {
  return [...nodes]
    .filter(n => (n.riskScore ?? 0) > 0)
    .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))
    .slice(0, top);
}

function getTotalEth(edges: GraphEdgeData[]): number {
  return edges.reduce((s, e) => s + toEth(e.value || '0'), 0);
}

function answerQuery(
  query: string,
  nodes: GraphNodeData[],
  edges: GraphEdgeData[]
): { text: string; isDisclaimer: boolean } {
  const lower = query.toLowerCase();
  const exits = getExits(nodes);
  const highRisk = getHighRisk(nodes);
  const totalEth = getTotalEth(edges);

  // Guardrail
  if (lower.includes('guilty') || lower.includes('convict') || lower.includes('verdict') || lower.includes('jail')) {
    return {
      text: `MANDATORY INVESTIGATIVE DISCLAIMER:\n\nTraceX is an analytical intelligence tool and does not make judicial determinations of legal guilt.\n\nJudicial findings of guilt remain the exclusive constitutional domain of the trial court based on authenticated evidence and statutory procedure.`,
      isDisclaimer: true,
    };
  }

  if (nodes.length === 0) {
    return {
      text: `No trace data loaded yet.\n\nEnter a transaction hash in the top bar and run a trace to populate the graph with real Ethereum Mainnet data.`,
      isDisclaimer: false,
    };
  }

  // Most suspicious wallet
  if (lower.includes('suspicious') || lower.includes('highest risk') || lower.includes('most risky') || lower.includes('dangerous')) {
    if (highRisk.length === 0) {
      return { text: `${nodes.length} wallets loaded but none have risk scores yet. Risk scoring activates after a full 4-hop trace.`, isDisclaimer: false };
    }
    const top = highRisk[0];
    const list = highRisk.map((n, i) =>
      `${i + 1}. ${n.label || fmt(n.address)}\n   ${n.address}\n   Risk: ${Math.round((n.riskScore ?? 0) * 100)}%  |  Hop ${(n as any).hopIndex ?? '?'}`
    ).join('\n\n');
    return {
      text: `Top suspicious wallets (live on-chain data):\n\n${list}\n\n**Most suspicious: ${top.label || fmt(top.address)}**\nAddress: ${top.address}\nRisk score: ${Math.round((top.riskScore ?? 0) * 100)}%`,
      isDisclaimer: false,
    };
  }

  // Exchange exits / VASPs
  if (lower.includes('exchange') || lower.includes('vasp') || lower.includes('exit') || lower.includes('off-ramp')) {
    if (exits.length === 0) {
      return { text: `No VASP exits identified yet in this trace (${nodes.length} nodes). The trace may not have completed Hop 4.`, isDisclaimer: false };
    }
    const list = exits.map(n => {
      const inflow = edges.filter(e => e.to === n.id || e.toAddress === n.address);
      const totalIn = inflow.reduce((s, e) => s + toEth(e.value || '0'), 0);
      return `• ${n.label || fmt(n.address)}\n  ${n.address}\n  Inflow: ${totalIn.toFixed(4)} ETH`;
    }).join('\n\n');
    return {
      text: `VASP / Exchange exits (${exits.length} found):\n\n${list}\n\nTotal ETH tracked across all hops: ${totalEth.toFixed(4)} ETH`,
      isDisclaimer: false,
    };
  }

  // Fund movement / trace
  if (lower.includes('trace') || lower.includes('movement') || lower.includes('fund') || lower.includes('flow') || lower.includes('victim')) {
    const sender = nodes.find(n => (n as any).hopIndex === 0 || n.id?.includes('hop0') || n.id?.includes('sender'));
    const recipient = nodes.find(n => (n as any).hopIndex === 1 || n.id?.includes('hop1') || n.id?.includes('recipient'));
    const hop2 = nodes.filter(n => (n as any).hopIndex === 2).length;
    const hop3 = nodes.filter(n => (n as any).hopIndex === 3).length;
    return {
      text: `Fund Flow (${nodes.length} wallets | ${edges.length} txs | ${totalEth.toFixed(4)} ETH):\n\nOrigin (Hop 0):\n  ${sender ? `${sender.label || fmt(sender.address)}\n  ${sender.address}` : 'Not identified'}\n\nHop 1 Recipient:\n  ${recipient ? `${recipient.label || fmt(recipient.address)}\n  ${recipient.address}` : 'Not identified'}\n\nHop 2 (dispersal): ${hop2} wallets\nHop 3 (transit): ${hop3} wallets\nHop 4 VASP exits: ${exits.length}\n\nAll data is live from Ethereum Mainnet via Blockscout.`,
      isDisclaimer: false,
    };
  }

  // Stats / count
  if (lower.includes('how many') || lower.includes('count') || lower.includes('total') || lower.includes('statistic') || lower.includes('wallet') || lower.includes('node')) {
    const hop2 = nodes.filter(n => (n as any).hopIndex === 2).length;
    const hop3 = nodes.filter(n => (n as any).hopIndex === 3).length;
    return {
      text: `Live graph statistics:\n• Total wallets: ${nodes.length}\n• Total transactions: ${edges.length}\n• ETH tracked: ${totalEth.toFixed(4)} ETH\n• Hop 2 wallets: ${hop2}\n• Hop 3 wallets: ${hop3}\n• VASP exits (Hop 4): ${exits.length}\n• Data source: Ethereum Mainnet / Blockscout`,
      isDisclaimer: false,
    };
  }

  // Peel chain
  if (lower.includes('peel') || lower.includes('hop') || lower.includes('chain') || lower.includes('layer')) {
    const hop2 = nodes.filter(n => (n as any).hopIndex === 2).length;
    const hop3 = nodes.filter(n => (n as any).hopIndex === 3).length;
    return {
      text: `Peel Chain Analysis:\n• Hop 2 (dispersal): ${hop2} wallets\n• Hop 3 (deep transit): ${hop3} wallets\n• Hop 4 VASP exits: ${exits.length}\n\n${hop2 + hop3} intermediate wallets used for layering before reaching exchange deposit addresses.`,
      isDisclaimer: false,
    };
  }

  // Default
  return {
    text: `Analysis of "${query}" against live graph:\n\n• Wallets: ${nodes.length} | Transactions: ${edges.length} | ETH: ${totalEth.toFixed(4)}\n• Top risk: ${highRisk[0] ? `${highRisk[0].label || fmt(highRisk[0].address)} (${Math.round((highRisk[0].riskScore ?? 0) * 100)}%)` : 'N/A'}\n• VASP exits: ${exits.length}\n\nTry: "most suspicious wallet", "exchange exits", "fund movement", or "how many wallets".`,
    isDisclaimer: false,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  liveNodes: GraphNodeData[];
  liveEdges: GraphEdgeData[];
  onSelectNodeById?: (nodeId: string) => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  liveNodes,
  liveEdges,
  onSelectNodeById,
}) => {
  const makeWelcome = (n: number, e: number): CopilotMessage => ({
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    text: n > 0
      ? `Live graph loaded: **${n} wallets**, **${e} transactions** from Ethereum Mainnet.\n\nAsk me about suspicious wallets, exchange exits, fund flow, or hop statistics.`
      : `TraceX Copilot ready. No trace loaded yet.\n\nEnter a transaction hash in the top bar and run a trace to begin.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<CopilotMessage[]>([
    makeWelcome(liveNodes.length, liveEdges.length),
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prevNodeCount = useRef(liveNodes.length);

  // Refresh welcome when live data first arrives
  useEffect(() => {
    if (liveNodes.length > 0 && prevNodeCount.current === 0) {
      setMessages([makeWelcome(liveNodes.length, liveEdges.length)]);
    }
    prevNodeCount.current = liveNodes.length;
  }, [liveNodes.length, liveEdges.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    'What is the most suspicious wallet?',
    'Show VASP exchange exits',
    'Fund movement from victim',
    'How many wallets in the graph?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const { text, isDisclaimer } = answerQuery(query, liveNodes, liveEdges);
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDisclaimer,
      }]);
      setIsTyping(false);
    }, 400);
  };

  const renderText = (text: string) =>
    text.split('\n').map((line, li, arr) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={li}>
          {parts.map((p, pi) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={pi} className="text-[#EEEBE2] font-semibold">{p.slice(2, -2)}</strong>
              : p
          )}
          {li < arr.length - 1 && <br />}
        </span>
      );
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-[340px] bg-[#161418] border-l border-[#2E2B32]
      shadow-2xl z-40 flex flex-col select-none text-xs">
      {/* Header */}
      <div className="h-11 px-4 border-b border-[#2E2B32] flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[#EDE8DE] font-semibold text-[11px] tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#B8935F]" />
          INVESTIGATION COPILOT
          {liveNodes.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-[#1A2B1F] border border-[#4A7C59]/50
              text-[#6BB58A] text-[9px] font-mono">
              LIVE · {liveNodes.length}W
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-[#7E7972] hover:text-[#EDE8DE] p-1 transition cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick prompts */}
      <div className="p-3 border-b border-[#2E2B32] flex flex-wrap gap-1.5">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[10px] px-2.5 py-1 rounded-md bg-[#1F1B22] hover:bg-[#2A262F]
              text-[#A8A399] hover:text-[#EDE8DE] border border-[#2E2B32] transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[9px] font-mono text-[#7E7972] mb-1">
              {msg.role === 'user' ? 'Investigator' : 'TraceX Forensic Engine'} · {msg.timestamp}
            </div>
            <div className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[95%] font-sans ${
              msg.role === 'user'
                ? 'bg-[#1F1B22] text-[#EDE8DE] border border-[#2E2B32]'
                : msg.isDisclaimer
                ? 'bg-[#2A1519] text-[#D8B493] border border-[#522329]'
                : 'bg-[#1C1A1E] text-[#A8A399] border border-[#252229]'
            }`}>
              <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-[10px] font-mono text-[#7E7972] p-1 animate-pulse">
            Analysing on-chain data…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#2E2B32]">
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask about wallets, exits, fund flow…"
            className="flex-1 h-9 px-3 rounded-lg bg-[#1C1A1E] border border-[#2E2B32]
              focus:border-[#B8935F] focus:outline-none text-xs text-[#EDE8DE]
              placeholder:text-[#7E7972] font-mono transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="h-9 px-3 rounded-lg bg-[#B8935F] hover:bg-[#CFAC78]
              text-[#131114] font-bold text-xs transition cursor-pointer
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};