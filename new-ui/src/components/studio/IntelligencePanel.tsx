import React, { useState, useEffect } from 'react';
import { ForensicCase, ForensicNode, ForensicFinding } from '../../types/forensics';
import { FindingList } from './FindingList';
import { EntityInspector } from './EntityInspector';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface IntelligencePanelProps {
  currentCase: ForensicCase;
  selectedNode: ForensicNode | null;
  onSelectNode: (node: ForensicNode) => void;
  activeFinding: ForensicFinding | null;
  onFocusFinding: (findingId: string) => void;
  onViewEvidence: (evidenceId?: string) => void;
  onOpenSection91Notice?: (node: ForensicNode) => void;
  onOpenCopilot: () => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  currentCase,
  selectedNode,
  onSelectNode,
  activeFinding,
  onFocusFinding,
  onViewEvidence,
  onOpenSection91Notice,
  onOpenCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'findings' | 'entity'>('findings');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If a node is selected, switch to entity tab smoothly
  useEffect(() => {
    if (selectedNode) {
      setActiveTab('entity');
      setIsCollapsed(false);
    }
  }, [selectedNode]);

  if (isCollapsed) {
    return (
      <div className="w-8 h-full bg-[#08090C] border-l border-[#15171D] flex flex-col items-center py-3 z-20 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-[#555861] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
          title="Expand Intelligence Panel"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[9.5px] font-mono text-[#555861] [writing-mode:vertical-rl] rotate-180 mt-6 tracking-widest uppercase">
          {activeTab === 'findings' ? 'FINDINGS' : 'ENTITY'}
        </span>
      </div>
    );
  }

  return (
    <aside className="w-76 md:w-84 h-full bg-[#08090C] border-l border-[#15171D] flex flex-col z-20 select-none text-xs">
      {/* Panel Tab Navigation */}
      <div className="h-10 px-3 border-b border-[#15171D] flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[10.5px]">
          <button
            onClick={() => setActiveTab('findings')}
            className={`transition pb-1 cursor-pointer ${
              activeTab === 'findings'
                ? 'text-[#EEEBE2] font-semibold border-b border-[#4FACFE]'
                : 'text-[#60636C] hover:text-[#A09D95]'
            }`}
          >
            FINDINGS ({currentCase.findings.length})
          </button>

          <button
            onClick={() => setActiveTab('entity')}
            className={`transition pb-1 cursor-pointer ${
              activeTab === 'entity'
                ? 'text-[#EEEBE2] font-semibold border-b border-[#4FACFE]'
                : 'text-[#60636C] hover:text-[#A09D95]'
            }`}
          >
            ENTITY {selectedNode && `(0x${selectedNode.address.slice(2, 6)})`}
          </button>

          <button
            onClick={onOpenCopilot}
            className="text-[#60636C] hover:text-[#EEEBE2] pb-1 transition cursor-pointer"
          >
            COPILOT
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="text-[#555861] hover:text-[#EEEBE2] p-1 transition cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Scroller */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'findings' ? (
          <FindingList
            findings={currentCase.findings}
            activeFinding={activeFinding}
            onFocusFinding={onFocusFinding}
            onViewEvidence={onViewEvidence}
          />
        ) : (
          <EntityInspector
            node={selectedNode}
            currentCase={currentCase}
            onSelectNode={onSelectNode}
            onViewEvidence={onViewEvidence}
            onOpenSection91Notice={onOpenSection91Notice}
          />
        )}
      </div>
    </aside>
  );
};
