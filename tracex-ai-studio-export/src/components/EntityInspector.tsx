import React, { useState } from 'react';
import { ForensicNode, ForensicEdge, ForensicCase } from '../types/forensics';
import { Copy, Check, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface EntityInspectorProps {
  node: ForensicNode | null;
  currentCase: ForensicCase;
  onSelectNode: (node: ForensicNode) => void;
  onViewEvidence: (evidenceId?: string) => void;
  onOpenSection91Notice?: (node: ForensicNode) => void;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  node,
  currentCase,
  onSelectNode,
  onViewEvidence,
  onOpenSection91Notice,
}) => {
  const [copied, setCopied] = useState(false);

  if (!node) {
    return (
      <div className="py-16 text-center text-[#555861] font-mono text-xs">
        Select a node in the network to inspect transaction telemetry and counterparties.
      </div>
    );
  }

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find incoming & outgoing flows for this node
  const counterparties: { node: ForensicNode; edge: ForensicEdge; direction: 'in' | 'out' }[] = [];
  currentCase.edges.forEach((edge) => {
    if (edge.source === node.id) {
      const target = currentCase.nodes.find((n) => n.id === edge.target);
      if (target) counterparties.push({ node: target, edge, direction: 'out' });
    } else if (edge.target === node.id) {
      const source = currentCase.nodes.find((n) => n.id === edge.source);
      if (source) counterparties.push({ node: source, edge, direction: 'in' });
    }
  });

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="pb-3 border-b border-[#14161C]">
        <div className="font-mono text-[9px] text-[#555861] uppercase tracking-wider">
          {node.type === 'vasp' ? 'EXCHANGE OFF-RAMP' : node.type.toUpperCase()}
        </div>
        <div className="text-sm font-semibold text-[#EEEBE2] mt-0.5">
          {node.label}
        </div>
        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-[#71747E]">
          <span className="truncate max-w-[190px]">{node.address}</span>
          <button
            onClick={() => handleCopy(node.address)}
            className="hover:text-[#EEEBE2] transition cursor-pointer"
            title="Copy address"
          >
            {copied ? <Check className="w-2.5 h-2.5 text-[#10B981]" /> : <Copy className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Sparse Elegant Numeric Metrics */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 pb-3 border-b border-[#14161C] font-mono">
        <div>
          <div className="text-[9px] text-[#555861] uppercase tracking-wider">Balance</div>
          <div className="text-base text-[#EEEBE2] font-semibold mt-0.5">
            {node.balanceEth} <span className="text-[10px] text-[#71747E] font-normal">ETH</span>
          </div>
          <div className="text-[9.5px] text-[#60636C]">${node.balanceUsd.toLocaleString()} USD</div>
        </div>

        <div>
          <div className="text-[9px] text-[#555861] uppercase tracking-wider">Taint Ratio</div>
          <div className="text-base text-[#D97706] font-semibold mt-0.5">
            {node.taintRatio}%
          </div>
          <div className="text-[9.5px] text-[#60636C]">Risk Score: {node.riskScore}/100</div>
        </div>

        <div>
          <div className="text-[9px] text-[#555861] uppercase tracking-wider">Hop Depth</div>
          <div className="text-xs text-[#A09D95] mt-0.5">
            Hop 0{node.hop}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-[#555861] uppercase tracking-wider">Evidence ID</div>
          <div className="text-[10px] text-[#4FACFE] mt-0.5">
            {node.evidenceId}
          </div>
        </div>
      </div>

      {/* Observed Signatures */}
      <div className="pb-3 border-b border-[#14161C]">
        <div className="text-[9px] font-mono text-[#555861] uppercase tracking-wider mb-1.5">
          Signatures & Indicators
        </div>
        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded bg-[#101217] text-[#8E8B83] border border-[#181B22]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Connected Stream Counterparties */}
      <div>
        <div className="text-[9px] font-mono text-[#555861] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Connected Streams</span>
          <span>({counterparties.length})</span>
        </div>

        <div className="space-y-1 font-mono text-[10.5px]">
          {counterparties.map(({ node: cp, edge, direction }) => (
            <div
              key={edge.id}
              onClick={() => onSelectNode(cp)}
              className="py-1 px-1.5 rounded hover:bg-[#12141A] flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className={direction === 'out' ? 'text-[#D97706]' : 'text-[#4FACFE]'}>
                  {direction === 'out' ? '→' : '←'}
                </span>
                <span className="text-[#CFCBC0] truncate">{cp.label}</span>
              </div>
              <span className="text-[#71747E] whitespace-nowrap">
                {edge.amountEth} ETH
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 space-y-2">
        {node.type === 'vasp' && onOpenSection91Notice && (
          <button
            onClick={() => onOpenSection91Notice(node)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#0A1710] hover:bg-[#102419] text-[#10B981] text-xs font-mono border border-[#143B27] transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Generate Statutory Sec 91 Notice</span>
          </button>
        )}

        <button
          onClick={() => onViewEvidence(node.evidenceId)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#13161D] hover:bg-[#1A1D27] text-[#EEEBE2] text-xs font-mono border border-[#1F232E] transition cursor-pointer"
        >
          <FileText className="w-3 h-3 text-[#71747E]" />
          <span>Examine Evidence Record</span>
        </button>
      </div>
    </div>
  );
};
