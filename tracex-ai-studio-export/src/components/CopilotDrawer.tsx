import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { CopilotMessage, ForensicCase } from '../types/forensics';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: ForensicCase;
  onSelectNodeById: (nodeId: string) => void;
  onSelectEdgeById: (edgeId: string) => void;
  onHighlightFinding: (findingId: string) => void;
  onViewEvidence: (evidenceId?: string) => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentCase,
  onSelectNodeById,
  onSelectEdgeById,
  onHighlightFinding,
  onViewEvidence,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Investigation dossier synchronized with **${currentCase.title}**.\n\nAll 16 wallet entities, peel chains, and exchange exits are indexed. Ask about fund movements or click citations to inspect the spatial network directly.`,
      timestamp: '14:46 UTC',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    'Trace movement from victim to exchange exits',
    'Which VASP deposit accounts hold stolen funds?',
    'Explain R2 peel chain mechanics in this case',
    'Is the suspect guilty?',
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

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      let isDisclaimer = false;
      const lower = query.toLowerCase();

      // Guardrail Check
      if (
        lower.includes('guilty') ||
        lower.includes('convict') ||
        lower.includes('verdict') ||
        lower.includes('jail')
      ) {
        replyText = `MANDATORY INVESTIGATIVE DISCLAIMER:\nTraceX is an analytical intelligence tool and does not make judicial determinations of legal guilt.\n\nForensic ledger software maps probabilistic and cryptographic trails. Judicial findings of guilt remain the exclusive constitutional domain of the trial court based on authenticated evidence [evidence:EVD-8841-TX-03] and statutory procedure.`;
        isDisclaimer = true;
      } else if (lower.includes('trace') || lower.includes('movement') || lower.includes('victim') || lower.includes('exit')) {
        replyText = `Fund Movement Synthesis:\n1. Origin: 840.0 ETH drained from Aegis Treasury via exploit [tx:0x4a8b71...].\n2. Passthrough: Dispatched in 42 seconds to transit splitter [finding:R1].\n3. Peel Chains: 500 ETH routed to peel anchor [wallet:node-peel-origin] and dispersed [finding:R2].\n4. Mixers: 180 ETH injected into Tornado Cash and Railgun [finding:R5].\n5. Exits: 35.05 ETH reached verified exchanges [finding:R8]: Binance (14.85 ETH) [tx:0x66fa91...], CoinDCX (8.20 ETH), and Kraken (12.00 ETH).`;
      } else if (lower.includes('exchange') || lower.includes('vasp') || lower.includes('binance') || lower.includes('account')) {
        replyText = `Identified Exchange Off-Ramp Exits:\n- Binance Hot Wallet 14: 14.85 ETH received via [tx:0x66fa91...]. Verified evidence logged in [evidence:EVD-8841-TX-13].\n- CoinDCX India: 8.20 ETH received at [wallet:node-coindcx-inbound].\n- Kraken Custody: 12.00 ETH swept via peel leaf [tx:0x44cd91...].\n\nTotal targetable balance across exchanges: 35.05 ETH ($101,294 USD).`;
      } else if (lower.includes('peel') || lower.includes('r2')) {
        replyText = `R2 Peel Chain Behavior:\nAnchor wallet [wallet:node-peel-origin] split the 500 ETH tranche into exact rounded increments (100 ETH to Tornado [finding:R5], 80 ETH to Railgun, and 12 ETH to Kraken) while maintaining 280 ETH as the active advancing core. This avoids static exchange threshold alarms.`;
      } else {
        replyText = `Analysis of "${query}":\n- Total volume: 840 ETH tracked across 4 hops.\n- Active patterns: 6 anomaly rules identified, with highest risk on rapid velocity [finding:R1] and exchange off-ramps [finding:R8].\n- Verified evidence can be inspected in the evidence docket.`;
      }

      const botMsg: CopilotMessage = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDisclaimer,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  // Render citation chips: [tx:...], [finding:...], [wallet:...], [evidence:...]
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\[tx:[^\]]+\]|\[finding:[^\]]+\]|\[wallet:[^\]]+\]|\[evidence:[^\]]+\])/g);

    return parts.map((part, idx) => {
      if (part.startsWith('[tx:')) {
        const val = part.slice(4, -1);
        const edge = currentCase.edges.find((e) => e.hash.startsWith(val) || e.id === val || e.hash.includes(val.replace('...', '')));
        return (
          <button
            key={idx}
            onClick={() => {
              if (edge) onSelectEdgeById(edge.id);
            }}
            className="inline-flex items-center px-1 py-0.2 mx-0.5 rounded bg-[#171B24] border border-[#273042] text-[#4D88FF] font-mono text-[9.5px] hover:border-[#4D88FF] transition cursor-pointer"
          >
            {val.length > 12 ? val.slice(0, 10) + '...' : val}
          </button>
        );
      } else if (part.startsWith('[finding:')) {
        const findingId = part.slice(9, -1);
        return (
          <button
            key={idx}
            onClick={() => onHighlightFinding(findingId)}
            className="inline-flex items-center px-1 py-0.2 mx-0.5 rounded bg-[#1C1710] border border-[#3E2D1A] text-[#D97706] font-mono text-[9.5px] hover:border-[#D97706] transition cursor-pointer"
          >
            Finding {findingId}
          </button>
        );
      } else if (part.startsWith('[wallet:')) {
        const nodeId = part.slice(8, -1);
        const node = currentCase.nodes.find((n) => n.id === nodeId || n.address.startsWith(nodeId));
        return (
          <button
            key={idx}
            onClick={() => {
              if (node) onSelectNodeById(node.id);
            }}
            className="inline-flex items-center px-1 py-0.2 mx-0.5 rounded bg-[#14161C] border border-[#232732] text-[#CFCBC0] font-mono text-[9.5px] hover:border-[#4D88FF] transition cursor-pointer"
          >
            {node?.label || nodeId}
          </button>
        );
      } else if (part.startsWith('[evidence:')) {
        const evId = part.slice(10, -1);
        return (
          <button
            key={idx}
            onClick={() => onViewEvidence(evId)}
            className="inline-flex items-center px-1 py-0.2 mx-0.5 rounded bg-[#11161B] border border-[#1E2B38] text-[#10B981] font-mono text-[9.5px] hover:border-[#10B981] transition cursor-pointer"
          >
            {evId}
          </button>
        );
      }

      // Format markdown bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={bIdx} className="text-[#EEEBE2] font-semibold">{bPart.slice(2, -2)}</strong>;
        }
        return bPart;
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-88 bg-[#090A0E] border-l border-[#16181E] shadow-2xl z-40 flex flex-col select-none text-xs animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="h-10 px-3 border-b border-[#16181E] flex items-center justify-between">
        <div className="font-mono text-[#EEEBE2] font-medium text-[11px] tracking-tight">
          INVESTIGATION COPILOT
        </div>
        <button
          onClick={onClose}
          className="text-[#60636C] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Queries */}
      <div className="p-2 border-b border-[#16181E] flex flex-wrap gap-1">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[10px] px-2 py-0.5 rounded bg-[#101217] hover:bg-[#161921] text-[#8E8B83] hover:text-[#EEEBE2] border border-[#191C23] transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[9px] font-mono text-[#555861] mb-1">
              {msg.role === 'user' ? 'Investigator' : 'TraceX Forensic Engine'} • {msg.timestamp}
            </div>

            <div
              className={`p-2.5 rounded text-xs leading-relaxed max-w-[95%] font-sans ${
                msg.role === 'user'
                  ? 'bg-[#151821] text-[#EEEBE2] border border-[#232836]'
                  : msg.isDisclaimer
                  ? 'bg-[#181310] text-[#D8B493] border border-[#3A271B]'
                  : 'bg-[#0E1015] text-[#A09D95] border border-[#1A1D25]'
              }`}
            >
              <div className="whitespace-pre-line">
                {renderMessageContent(msg.text)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="text-[10px] font-mono text-[#60636C] p-1">
            Synthesizing ledger evidence...
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[#16181E]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Query transaction paths or citations..."
            className="flex-1 h-8 px-2.5 rounded bg-[#0E1015] border border-[#181B22] focus:border-[#4D88FF] focus:outline-none text-xs text-[#EEEBE2] placeholder:text-[#555861] font-mono transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="h-8 px-2.5 rounded bg-[#151821] hover:bg-[#1D212E] text-[#EEEBE2] text-xs font-medium border border-[#232733] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
