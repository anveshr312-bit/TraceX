import React from 'react';
import { ForensicNode, ForensicEdge, ForensicFinding } from '../types/forensics';
import { NetworkVisualization } from './NetworkVisualization';

interface ForensicCanvasProps {
  nodes: ForensicNode[];
  edges: ForensicEdge[];
  selectedNode: ForensicNode | null;
  onSelectNode: (node: ForensicNode | null) => void;
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string | null) => void;
  activeFinding: ForensicFinding | null;
  currentHopLimit: number;
  highlightedFindingId: string | null;
  onViewEvidence: (evidenceId?: string) => void;
  onOpenSection91Notice?: (node: ForensicNode) => void;
}

export const ForensicCanvas: React.FC<ForensicCanvasProps> = (props) => {
  return (
    <div className="flex-1 h-full w-full relative overflow-hidden bg-[#07080A]">
      <NetworkVisualization {...props} />
    </div>
  );
};
