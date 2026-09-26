import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ForensicCase, 
  TerminalEntityNode, 
  VisMode, 
  CopilotCitation 
} from './types/forensics';
import { 
  GraphNodeData, 
  GraphEdgeData, 
  NodeType, 
  ForensicFindingItem 
} from './types/graph3d';
import { PRIMARY_CASE, ALL_CASES } from './data/dossierFixture';
import { 
  SAMPLE_NODES, 
  SAMPLE_EDGES, 
  FORENSIC_FINDINGS, 
  PRESET_TRACES 
} from './data/graph3dData';

// 3D Engine & HUD
import { ForensicCanvas3D } from './components/ForensicCanvas3D';
import { TopBar } from './components/hud/TopBar';
import { LeftSidebar } from './components/hud/LeftSidebar';
import { RightDossierPanel as RightDossierPanel3D } from './components/hud/RightDossierPanel';
import { BottomStatusBar } from './components/hud/BottomStatusBar';
import { PlaybackControlBar } from './components/hud/PlaybackControlBar';
import { CanvasOverlayControls } from './components/hud/CanvasOverlayControls';

// 2D Dendrogram Components
import { TopNavigation } from './components/TopNavigation';
import { HierarchicalTreeCanvas } from './components/HierarchicalTreeCanvas';
import { FloatingGraphToolbar } from './components/FloatingGraphToolbar';
import { RightDossierPanel as RightDossierPanel2D } from './components/RightDossierPanel';

// Shared Modals
import { Section91NoticeModal } from './components/Section91NoticeModal';
import { EvidencePanel } from './components/EvidencePanel';
import { NewInvestigationModal } from './components/NewInvestigationModal';

export default function App() {
  // Primary View Mode: '3d' (Full-screen 3D WebGL Graph) vs '2d' (Hierarchical Dendrogram)
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // --- 3D Scene Dimension & Playback State ---
  const [dimensionMode, setDimensionMode] = useState<'3D' | '2D'>('3D');
  // Starts at hop 4 so the full graph is comfortably visible on initial load
  const [currentHop, setCurrentHop] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(0);
  const [showTraceCompleteToast, setShowTraceCompleteToast] = useState<boolean>(false);

  // --- 3D Graph Data State ---
  const [nodes, setNodes] = useState<GraphNodeData[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<GraphEdgeData[]>(SAMPLE_EDGES);
  const [findings, setFindings] = useState<ForensicFindingItem[]>(FORENSIC_FINDINGS);
  const [selectedNode3D, setSelectedNode3D] = useState<GraphNodeData | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<NodeType>>(new Set());
  const [timelineBlock, setTimelineBlock] = useState<number>(18234070);
  const [focusedNodeIds, setFocusedNodeIds] = useState<string[] | null>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [caseTitle, setCaseTitle] = useState<string>('Case #TRX-2024-00847 — Phishing Drain (142.5 ETH)');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(false);

  // --- 2D Dendrogram State ---
  const [currentCase, setCurrentCase] = useState<ForensicCase>(PRIMARY_CASE);
  const [allCases, setAllCases] = useState<ForensicCase[]>(ALL_CASES);
  const [activeCategoryId, setActiveCategoryId] = useState<'peel' | 'mixer' | 'gas' | 'vasp'>('vasp');
  const [selectedTerminalNode, setSelectedTerminalNode] = useState<TerminalEntityNode>(
    PRIMARY_CASE.categories[3].terminalNodes[0]
  );
  const [visMode2D, setVisMode2D] = useState<VisMode>('tree');
  const [zoom2D, setZoom2D] = useState<number>(0.92);
  const [expandAll2D, setExpandAll2D] = useState<boolean>(false);
  const [filterText2D, setFilterText2D] = useState<string>('');
  const [searchQuery2D, setSearchQuery2D] = useState<string>('');
  const [highlightedTxHash2D, setHighlightedTxHash2D] = useState<string | null>(null);

  // --- Shared Modals State ---
  const [isSection91Open, setIsSection91Open] = useState<boolean>(false);
  const [section91TargetNode, setSection91TargetNode] = useState<GraphNodeData | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState<boolean>(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [isNewInvestigationOpen, setIsNewInvestigationOpen] = useState<boolean>(false);

  // --- Playback Loop Engine ---
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = (currentHop === 0 ? 1200 : 1500) / playbackSpeed;
    const timer = setTimeout(() => {
      setCurrentHop((prev) => {
        if (prev < 4) {
          const next = prev + 1;
          if (next === 4) {
            setIsPlaying(false);
            setShowTraceCompleteToast(true);
            setTimeout(() => setShowTraceCompleteToast(false), 2000);
          }
          return next;
        } else {
          setIsPlaying(false);
          return 4;
        }
      });
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentHop, playbackSpeed]);

  // Synchronize 2D categories and active nodes with currentHop
  useEffect(() => {
    if (currentHop === 0) {
      setActiveCategoryId('gas');
      const gasNode = currentCase.categories.find(c => c.id === 'gas')?.terminalNodes[0];
      if (gasNode) setSelectedTerminalNode(gasNode);
    } else if (currentHop === 1) {
      setActiveCategoryId('peel');
      const peelNode = currentCase.categories.find(c => c.id === 'peel')?.terminalNodes[0];
      if (peelNode) setSelectedTerminalNode(peelNode);
    } else if (currentHop === 2) {
      setActiveCategoryId('mixer');
      const mixerNode = currentCase.categories.find(c => c.id === 'mixer')?.terminalNodes[0];
      if (mixerNode) setSelectedTerminalNode(mixerNode);
    } else if (currentHop === 3) {
      setActiveCategoryId('vasp');
      const vaspNode = currentCase.categories.find(c => c.id === 'vasp')?.terminalNodes[0];
      if (vaspNode) setSelectedTerminalNode(vaspNode);
    } else if (currentHop === 4) {
      setActiveCategoryId('vasp');
      const vaspNode = currentCase.categories.find(c => c.id === 'vasp')?.terminalNodes[0];
      if (vaspNode) setSelectedTerminalNode(vaspNode);
    }
  }, [currentHop, currentCase]);

  const handlePlayPause = useCallback(() => {
    if (currentHop === 4) {
      // Replay from Hop 0
      setCurrentHop(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentHop]);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentHop((prev) => {
      if (prev < 4) {
        const next = prev + 1;
        if (next === 4) {
          setShowTraceCompleteToast(true);
          setTimeout(() => setShowTraceCompleteToast(false), 2000);
        }
        return next;
      }
      return 4;
    });
  }, []);

  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentHop((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkipToStart = useCallback(() => {
    setIsPlaying(false);
    setCurrentHop(0);
  }, []);

  const handleSkipToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentHop(4);
    setShowTraceCompleteToast(true);
    setTimeout(() => setShowTraceCompleteToast(false), 2000);
  }, []);

  const handleToggleDimension = useCallback((mode: '3D' | '2D') => {
    setDimensionMode(mode);
    if (mode === '3D') {
      // When tapping 3D, start zoomed in on victim's wallet, then hop to the next wallet, and zoom out as hopping progresses
      setSelectedNode3D(null);
      setCurrentHop(0);
      setIsPlaying(true);
    }
  }, []);

  const handleResetView = useCallback(() => {
    setResetViewTrigger((c) => c + 1);
    setSelectedNode3D(null);
  }, []);

  // --- 3D Actions ---
  const handleToggleNodeType = useCallback((type: NodeType) => {
    setHiddenNodeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleFocusFinding = useCallback((matchedNodeIds: string[]) => {
    setFocusedNodeIds(matchedNodeIds);
    if (matchedNodeIds.length > 0) {
      const matchedNode = nodes.find((n) => n.id === matchedNodeIds[0]);
      if (matchedNode) {
        setSelectedNode3D(matchedNode);
      }
    }
    setTimeout(() => {
      setFocusedNodeIds(null);
    }, 4500);
  }, [nodes]);

  const handleRunTrace = useCallback((hash: string, newTitle: string) => {
    setIsTracing(true);
    setTimeout(() => {
      setIsTracing(false);
      setCaseTitle(newTitle);
      // Restart playback at hop 0 to show trace hopping
      setCurrentHop(0);
      setIsPlaying(true);
      const originNode = nodes.find((n) => n.type === 'FRAUD_ORIGIN');
      if (originNode) {
        setSelectedNode3D(originNode);
      }
    }, 1800);
  }, [nodes]);

  const handleOpenSection91From3D = useCallback((node: GraphNodeData) => {
    setSection91TargetNode(node);
    setIsSection91Open(true);
  }, []);

  // --- 2D Actions ---
  const handleSelectCategory2D = useCallback((catId: 'peel' | 'mixer' | 'gas' | 'vasp') => {
    setActiveCategoryId(catId);
    const cat = currentCase.categories.find((c) => c.id === catId);
    if (cat && cat.terminalNodes.length > 0) {
      setSelectedTerminalNode(cat.terminalNodes[0]);
    }
  }, [currentCase]);

  const handleSelectTerminal2D = useCallback((node: TerminalEntityNode) => {
    setSelectedTerminalNode(node);
    setActiveCategoryId(node.categoryId);
  }, []);

  const handleOpenSection91From2D = useCallback((node: TerminalEntityNode) => {
    const adaptedNode: GraphNodeData = {
      id: node.id,
      type: 'EXCHANGE_EXIT',
      address: node.address,
      label: node.name,
      balance: `${node.amountEth} ETH`,
      balanceEth: node.amountEth,
      balanceUsd: node.amountUsd,
      riskScore: node.riskRating,
      tags: node.tags,
      evidenceIds: [node.evidenceId],
    };
    setSection91TargetNode(adaptedNode);
    setIsSection91Open(true);
  }, []);

  const handleFocusCitation2D = useCallback((citation: CopilotCitation) => {
    if (citation.type === 'category') {
      const catId = citation.id as 'peel' | 'mixer' | 'gas' | 'vasp';
      handleSelectCategory2D(catId);
    } else if (citation.type === 'wallet') {
      const allTerminals = currentCase.categories.flatMap((c) => c.terminalNodes);
      const found = allTerminals.find((t) => t.id === citation.id || t.name === citation.label);
      if (found) {
        handleSelectTerminal2D(found);
      }
    } else if (citation.type === 'evidence') {
      setSelectedEvidenceId(citation.id);
      setIsEvidenceOpen(true);
    } else if (citation.type === 'transaction') {
      setHighlightedTxHash2D(citation.id);
      setTimeout(() => setHighlightedTxHash2D(null), 3000);
    }
  }, [currentCase, handleSelectCategory2D, handleSelectTerminal2D]);

  // Start new trace from Investigation Modal
  const handleStartTrace = useCallback((txHash: string, firNumber: string, chain: string) => {
    const newCaseTitle = `${firNumber} — ${txHash.slice(0, 8)}... (${chain})`;
    setCaseTitle(newCaseTitle);
    
    // Update 2D state
    const newCase: ForensicCase = {
      ...currentCase,
      id: `case-${Date.now()}`,
      title: `${firNumber}: Rapid Egress Trace`,
      firNumber,
      chain,
      rootAnchor: {
        ...currentCase.rootAnchor,
        txHash,
        label: `Fraud Root: ${txHash.slice(0, 10)}... Siphon`,
      },
    };
    setAllCases((prev) => [newCase, ...prev]);
    setCurrentCase(newCase);
    setActiveCategoryId('vasp');
    setSelectedTerminalNode(newCase.categories[3].terminalNodes[0]);

    // Update 3D state
    handleRunTrace(txHash, newCaseTitle);
  }, [currentCase, handleRunTrace]);

  // Filter 2D Categories
  const filteredCategories2D = useMemo(() => {
    return currentCase.categories.map((cat) => ({
      ...cat,
      terminalNodes: filterText2D.trim()
        ? cat.terminalNodes.filter((t) => 
            t.name.toLowerCase().includes(filterText2D.toLowerCase()) ||
            t.address.toLowerCase().includes(filterText2D.toLowerCase()) ||
            t.status.toLowerCase().includes(filterText2D.toLowerCase())
          )
        : cat.terminalNodes,
    }));
  }, [currentCase, filterText2D]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020617] text-[#EEEBE2] font-sans select-none relative">
      {/* ============================================================== */}
      {/* 3D WebGL GRAPH MODE (Primary Centerpiece)                      */}
      {/* ============================================================== */}
      {viewMode === '3d' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Layer 0 & 1: 3D Force-Directed Graph Inside Canvas */}
          <ForensicCanvas3D
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode3D}
            onSelectNode={setSelectedNode3D}
            hoveredNodeId={hoveredNodeId}
            onHoverNode={setHoveredNodeId}
            hiddenNodeTypes={hiddenNodeTypes}
            timelineBlock={timelineBlock}
            focusedNodeIds={focusedNodeIds}
            dimensionMode={dimensionMode}
            currentHop={currentHop}
            playbackSpeed={playbackSpeed}
            resetViewTrigger={resetViewTrigger}
          />

          {/* Layer 2: 2D HUD Overlays (Glassmorphism Panels Floating on Top) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
            {/* Panel A: Top Bar */}
            <TopBar
              caseTitle={caseTitle}
              nodeCount={nodes.length}
              edgeCount={edges.length}
              viewMode={viewMode}
              onToggleViewMode={(mode) => {
                setViewMode(mode);
                if (mode === '3d') {
                  handleToggleDimension('3D');
                }
              }}
              onOpenNewInvestigation={() => setIsNewInvestigationOpen(true)}
              onOpenEvidence={() => {
                setSelectedEvidenceId(null);
                setIsEvidenceOpen(true);
              }}
              onResetCamera={handleResetView}
            />

            {/* Top-Right Canvas Overlay Controls: 2D / 3D Toggle + Reset View */}
            <CanvasOverlayControls
              dimensionMode={dimensionMode}
              onToggleDimension={handleToggleDimension}
              onResetView={handleResetView}
              showTraceCompleteToast={showTraceCompleteToast}
            />

            {/* Middle Zone: Floating Left Sidebar & Right Dossier Panel */}
            <div className="flex-1 flex justify-between overflow-hidden relative p-3">
              {/* Panel B: Left Sidebar (Collapsible Control Cockpit) */}
              <LeftSidebar
                isCollapsed={isLeftSidebarCollapsed}
                onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
                onRunTrace={handleRunTrace}
                isTracing={isTracing}
                hiddenNodeTypes={hiddenNodeTypes}
                onToggleNodeType={handleToggleNodeType}
                findings={findings}
                onFocusFinding={handleFocusFinding}
                timelineBlock={timelineBlock}
                onTimelineChange={setTimelineBlock}
                minBlock={18234005}
                maxBlock={18234065}
              />

              {/* Panel C: Right Dossier Panel (Slides in on Node Click) */}
              <RightDossierPanel3D
                node={selectedNode3D}
                onClose={() => setSelectedNode3D(null)}
                onOpenSection91Notice={handleOpenSection91From3D}
              />
            </div>

            {/* Requirement 4: Bottom-Center Trace Playback Control Bar */}
            <div className="w-full flex justify-center pb-2 pointer-events-none">
              <PlaybackControlBar
                currentHop={currentHop}
                maxHops={4}
                isPlaying={isPlaying}
                speed={playbackSpeed}
                onPlayPause={handlePlayPause}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onSkipToStart={handleSkipToStart}
                onSkipToEnd={handleSkipToEnd}
                onChangeSpeed={setPlaybackSpeed}
                isComplete={currentHop === 4}
              />
            </div>

            {/* Panel D: Bottom Status Bar */}
            <BottomStatusBar
              networkName="Ethereum Mainnet · Forked Heuristics"
              nodeCount={nodes.length}
              hopCount={4}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2D HIERARCHICAL DENDROGRAM MODE                                */}
      {/* ============================================================== */}
      {viewMode === '2d' && (
        <div className="flex flex-col h-full w-full overflow-hidden bg-[#090B0E]">
          {/* Top Bar with View Switcher */}
          <TopBar
            caseTitle={currentCase.title}
            nodeCount={12}
            edgeCount={14}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onOpenNewInvestigation={() => setIsNewInvestigationOpen(true)}
            onOpenEvidence={() => {
              setSelectedEvidenceId(null);
              setIsEvidenceOpen(true);
            }}
          />

          {/* Sub Navigation */}
          <TopNavigation
            currentCase={currentCase}
            allCases={allCases}
            onSelectCase={setCurrentCase}
            searchQuery={searchQuery2D}
            onSearchChange={setSearchQuery2D}
            onSearchSelectTerminal={handleSelectTerminal2D}
            onOpenEvidence={() => {
              setSelectedEvidenceId(null);
              setIsEvidenceOpen(true);
            }}
          />

          {/* 2D Canvas & Dossier */}
          <div className="flex-1 flex overflow-hidden relative">
            <FloatingGraphToolbar
              visMode={visMode2D}
              onChangeVisMode={setVisMode2D}
              onZoomIn={() => setZoom2D((z) => Math.min(z + 0.12, 2.0))}
              onZoomOut={() => setZoom2D((z) => Math.max(z - 0.12, 0.45))}
              onResetView={() => setZoom2D(0.92)}
              expandAll={expandAll2D}
              onToggleExpandAll={() => setExpandAll2D(!expandAll2D)}
              onNewInvestigation={() => setIsNewInvestigationOpen(true)}
              filterText={filterText2D}
              onFilterChange={setFilterText2D}
            />

            <HierarchicalTreeCanvas
              rootAnchor={currentCase.rootAnchor}
              categories={filteredCategories2D}
              activeCategoryId={activeCategoryId}
              onSelectCategory={handleSelectCategory2D}
              selectedTerminalNode={selectedTerminalNode}
              onSelectTerminalNode={handleSelectTerminal2D}
              visMode={visMode2D}
              onChangeVisMode={setVisMode2D}
              expandAll={expandAll2D}
              onToggleExpandAll={() => setExpandAll2D(!expandAll2D)}
              onOpenSection91={handleOpenSection91From2D}
              onViewEvidence={(evId) => {
                setSelectedEvidenceId(evId || null);
                setIsEvidenceOpen(true);
              }}
              highlightedTxHash={highlightedTxHash2D}
              onFocusRoot={() => setActiveCategoryId('vasp')}
              zoom={zoom2D}
              onZoomChange={setZoom2D}
              onResetView={() => setZoom2D(0.92)}
            />

            <RightDossierPanel2D
              node={selectedTerminalNode}
              currentCase={currentCase}
              onOpenSection91={handleOpenSection91From2D}
              onViewEvidence={(evId) => {
                setSelectedEvidenceId(evId || null);
                setIsEvidenceOpen(true);
              }}
              onFocusCitation={handleFocusCitation2D}
            />

            {/* Trace Playback Control Bar in 2D Viewport */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <PlaybackControlBar
                currentHop={currentHop}
                maxHops={4}
                isPlaying={isPlaying}
                speed={playbackSpeed}
                onPlayPause={handlePlayPause}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onSkipToStart={handleSkipToStart}
                onSkipToEnd={handleSkipToEnd}
                onChangeSpeed={setPlaybackSpeed}
                isComplete={currentHop === 4}
              />
            </div>

            {/* Trace Complete Toast Notification in 2D */}
            {showTraceCompleteToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-5 py-2.5 rounded-full backdrop-blur-xl bg-slate-950/90 border border-emerald-400/50 shadow-[0_0_25px_rgba(52,211,153,0.35)] flex items-center gap-2.5 font-mono text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-300 tracking-wider uppercase">
                    Trace Complete
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300">All 4 Hops Resolved to VASP Exits</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status Bar in 2D View */}
          <BottomStatusBar
            networkName="Ethereum Mainnet · Forked Heuristics"
            nodeCount={12}
            hopCount={4}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* COMMON LEGAL & INVESTIGATION MODALS                           */}
      {/* ============================================================== */}
      <Section91NoticeModal
        isOpen={isSection91Open}
        onClose={() => setIsSection91Open(false)}
        node={section91TargetNode}
      />

      <EvidencePanel
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        selectedEvidenceId={selectedEvidenceId}
      />

      <NewInvestigationModal
        isOpen={isNewInvestigationOpen}
        onClose={() => setIsNewInvestigationOpen(false)}
        onStartTrace={handleStartTrace}
      />
    </div>
  );
}
