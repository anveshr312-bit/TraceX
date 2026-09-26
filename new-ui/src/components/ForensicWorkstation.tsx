import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ForensicCase, 
  TerminalEntityNode, 
  VisMode, 
  CopilotCitation 
} from '../types/forensics';
import { 
  GraphNodeData, 
  GraphEdgeData, 
  NodeType, 
  ForensicFindingItem 
} from '../types/graph3d';
import { PRIMARY_CASE, ALL_CASES } from '../data/dossierFixture';
import { 
  SAMPLE_NODES, 
  SAMPLE_EDGES, 
  FORENSIC_FINDINGS, 
  PRESET_TRACES,
  generateDynamicTraceData
} from '../data/graph3dData';
import { fetchLiveBlockchainTrace } from '../services/liveBlockchainService';
import { getCase } from '../api/client';
import { Activity } from 'lucide-react';

// 3D Engine & HUD
import { ForensicCanvas3D } from './studio/ForensicCanvas3D';
import { TopBar } from './studio/hud/TopBar';
import { LeftSidebar } from './studio/hud/LeftSidebar';
import { RightDossierPanel as RightDossierPanel3D } from './studio/hud/RightDossierPanel3D';
import { BottomStatusBar } from './studio/hud/BottomStatusBar';
import { PlaybackControlBar } from './studio/hud/PlaybackControlBar';
import { CanvasOverlayControls } from './studio/hud/CanvasOverlayControls';

// 2D Dendrogram Components
import { TopNavigation } from './studio/TopNavigation';
import { HierarchicalTreeCanvas } from './studio/HierarchicalTreeCanvas';
import { FloatingGraphToolbar } from './studio/FloatingGraphToolbar';
import { RightDossierPanel as RightDossierPanel2D } from './studio/RightDossierPanel';

// Shared Modals
import { Section91NoticeModal } from './studio/Section91NoticeModal';
import { EvidencePanel } from './studio/EvidencePanel';
import { NewInvestigationModal } from './studio/NewInvestigationModal';
import { CopilotDrawer } from './studio/CopilotDrawer';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ForensicErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Forensic Workstation Error Boundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-white font-mono select-none">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <span className="text-xl font-bold">!</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Forensic Engine Auto-Stabilized</h2>
              <p className="text-xs text-slate-400 mt-1">
                A rendering issue was intercepted and prevented from blanking the screen.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-white/10 text-[11px] text-cyan-300 text-left font-mono break-all max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition cursor-pointer"
            >
              Resume Investigation
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ForensicWorkstationInner({ caseId }: { caseId: string }) {
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
  const [traceProgress, setTraceProgress] = useState<number>(0);
  const [traceStepText, setTraceStepText] = useState<string>('');
  const [tracingTarget, setTracingTarget] = useState<string>('');
  const [caseTitle, setCaseTitle] = useState<string>('Case #TRX-2024-00847 — Phishing Drain (142.5 ETH)');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);


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

  // Compute graph block range dynamically
  const { minGraphBlock, maxGraphBlock } = useMemo(() => {
    if (!edges || edges.length === 0) {
      return { minGraphBlock: 18234005, maxGraphBlock: 18234070 };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const e of edges) {
      if (e.blockNumber) {
        if (e.blockNumber < min) min = e.blockNumber;
        if (e.blockNumber > max) max = e.blockNumber;
      }
    }
    if (!isFinite(min)) min = 18234005;
    if (!isFinite(max)) max = 18234070;
    if (min === max) {
      min = min - 5;
      max = max + 20;
    }
    return { minGraphBlock: min, maxGraphBlock: max };
  }, [edges]);
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
  }, []);

  const handleResetView = useCallback(() => {
    setResetViewTrigger((c) => c + 1);
    setSelectedNode3D(null);
  }, []);

  const handleHopToNode = useCallback((nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (targetNode) {
      setSelectedNode3D(targetNode);
      setFocusedNodeIds([nodeId]);
      setTimeout(() => setFocusedNodeIds(null), 3500);
    }
  }, [nodes]);

  // Press Escape to reset camera and return to full graph overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetView]);

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

  const handleRunTrace = useCallback(async (hash: string, newTitle: string) => {
    setIsTracing(true);
    setTracingTarget(hash);
    setSelectedNode3D(null);
    setTraceProgress(10);
    setTraceStepText('Querying Ethereum Mainnet RPC & Mempool Ingestion Engine...');

    try {
      const result = await fetchLiveBlockchainTrace(hash, newTitle, (text, progress) => {
        setTraceStepText(text);
        setTraceProgress(progress);
      });

      // Pacing pause so investigator sees final 100% resolution
      setTimeout(() => {
        const computedMaxBlock = result.edges.reduce(
          (max, e) => Math.max(max, e.blockNumber || 0),
          result.startBlock + 20
        );
        setNodes(result.nodes);
        setEdges(result.edges);
        setCaseTitle(result.title);
        setTimelineBlock(computedMaxBlock);
        setIsLive(result.isLive);

        // Keep 2D case synced as well
        setCurrentCase((prev) => ({
          ...prev,
          title: result.title,
          rootAnchor: {
            ...prev.rootAnchor,
            address: result.nodes[0]?.address || prev.rootAnchor.address,
            label: result.nodes[0]?.label || `Fraud Root: ${result.nodes[0]?.balance || '10 ETH'}`,
            stolenEth: result.nodes[0]?.balanceEth || 10,
            stolenUsd: result.nodes[0]?.balanceUsd || 34200,
            blockNumber: result.startBlock,
            txHash: hash.startsWith('0x') && hash.length === 66 ? hash : `0x${Array.from({length: 64}, (_, i) => hash.charCodeAt(i % hash.length).toString(16)[0]).join('')}`,
          }
        }));

        setIsTracing(false);
        setCurrentHop(4);
        setIsPlaying(false);
        handleResetView();
        setShowTraceCompleteToast(true);
        setTimeout(() => setShowTraceCompleteToast(false), 2500);
      }, 600);
    } catch (err: any) {
      console.error('[handleRunTrace] Trace failure:', err);
      setIsTracing(false);
    }
  }, [handleResetView]);

  // Automatically trigger trace if caseId has an associated fraud_tx_hash or is an address/tx
  useEffect(() => {
    if (!caseId || caseId === 'case_ncrp_2026_001') return;

    if (caseId.startsWith('0x') && (caseId.length === 66 || caseId.length === 42)) {
      handleRunTrace(caseId, `Investigation — ${caseId.slice(0, 10)}...`);
      return;
    }

    getCase(caseId)
      .then((caseItem) => {
        if (caseItem && caseItem.fraud_tx_hash) {
          handleRunTrace(
            caseItem.fraud_tx_hash,
            `${caseItem.complaint_ref || 'Case'} — ${caseItem.fraud_tx_hash.slice(0, 10)}...`
          );
        } else {
          const generated = generateDynamicTraceData(caseId);
          setNodes(generated.nodes);
          setEdges(generated.edges);
          setCaseTitle(generated.title);
          setTimelineBlock(generated.startBlock + 25);
        }
      })
      .catch(() => {
        const generated = generateDynamicTraceData(caseId);
        setNodes(generated.nodes);
        setEdges(generated.edges);
        setCaseTitle(generated.title);
        setTimelineBlock(generated.startBlock + 25);
      });
  }, [caseId, handleRunTrace]);

  const handleScrubHop = useCallback((hop: number) => {
    setIsPlaying(false);
    setCurrentHop(hop);
    if (hop === 4) {
      setShowTraceCompleteToast(true);
      setTimeout(() => setShowTraceCompleteToast(false), 2000);
    }
  }, []);

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
            onDeselect={handleResetView}
          />

          {/* Layer 2: 2D HUD Overlays (Glassmorphism Panels Floating on Top) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-20">
            {/* Panel A: Top Bar */}
            <TopBar
              caseTitle={caseTitle}
              nodeCount={nodes.length}
              edgeCount={edges.length}
              viewMode={viewMode}
              isLive={isLive}
              onQuickTrace={handleRunTrace}
              isTracing={isTracing}
              onToggleSidebar={() => setIsLeftSidebarCollapsed((c) => !c)}
              isSidebarOpen={!isLeftSidebarCollapsed}
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
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onResetCamera={handleResetView}
            />


            {/* Top-Right Canvas Overlay Controls: 2D / 3D Toggle + Reset View */}
            <CanvasOverlayControls
              dimensionMode={dimensionMode}
              onToggleDimension={handleToggleDimension}
              onResetView={handleResetView}
              showTraceCompleteToast={showTraceCompleteToast}
              isDossierOpen={Boolean(selectedNode3D)}
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
                minBlock={minGraphBlock}
                maxBlock={maxGraphBlock}
              />

              {/* Panel C: Right Dossier Panel (Slides in on Node Click) */}
              {selectedNode3D && (
                <RightDossierPanel3D
                  node={selectedNode3D}
                  onClose={() => setSelectedNode3D(null)}
                  onOpenSection91Notice={handleOpenSection91From3D}
                  onResetOverview={handleResetView}
                  onHopToNode={handleHopToNode}
                  connectedEdges={edges}
                  allNodes={nodes}
                />
              )}
            </div>

            {/* Requirement 4: Bottom-Center Trace Playback Control Bar with Scrubbing */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
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
                onScrubHop={handleScrubHop}
                onChangeSpeed={setPlaybackSpeed}
                isComplete={currentHop === 4}
              />
            </div>

            {/* Panel D: Bottom Status Bar */}
            <BottomStatusBar
              networkName={isLive ? 'Ethereum Mainnet · Live On-Chain RPC' : 'Simulation Engine · Forensic Archetype'}
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
            isLive={isLive}
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

      {/* AI Copilot — wired to real live graph data (no hardcoded fixtures) */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        liveNodes={nodes}
        liveEdges={edges}
      />

      {/* ============================================================== */}
      {/* CYBER FORENSIC TRACING PROGRESS OVERLAY MODAL                 */}
      {/* ============================================================== */}
      {isTracing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md select-none font-mono text-white p-4">
          <div className="max-w-xl w-full p-6 sm:p-7 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-[0_0_80px_rgba(6,182,212,0.3)] relative overflow-hidden">
            {/* Top scanning accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Activity className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
                    <span>EXEC_ONCHAIN_TRACE</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold animate-pulse">
                      LIVE INGESTION
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                    Target Query: <span className="text-cyan-300 font-semibold">{tracingTarget || 'Mempool Query'}</span>
                  </p>
                </div>
              </div>

              {/* Progress Percentage Badge */}
              <div className="text-right">
                <div className="text-2xl font-black text-cyan-400 tracking-tight">
                  {traceProgress}%
                </div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                  Processing
                </div>
              </div>
            </div>

            {/* Glowing Dual Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Pipeline Execution Status:</span>
                </span>
                <span className="text-cyan-300 font-semibold">{traceProgress} / 100%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-950 border border-cyan-500/30 overflow-hidden relative p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                  style={{ width: `${traceProgress}%` }}
                />
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 text-[11px]">
              <div className={`p-2.5 rounded-xl border transition-all ${traceProgress >= 28 ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-950/60 border-white/5 text-slate-500'}`}>
                <div className="flex items-center gap-2 font-bold">
                  <span className={traceProgress >= 28 ? 'text-emerald-400' : ''}>{traceProgress >= 28 ? '✓' : '1.'}</span>
                  <span>Mempool & Gas Sponsors</span>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-1">Block origin & funding relayer scan</div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${traceProgress >= 54 ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-950/60 border-white/5 text-slate-500'}`}>
                <div className="flex items-center gap-2 font-bold">
                  <span className={traceProgress >= 54 ? 'text-emerald-400' : ''}>{traceProgress >= 54 ? '✓' : '2.'}</span>
                  <span>Peel Chain Traversal</span>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-1">High-velocity sub-minute peel splits</div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${traceProgress >= 78 ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200' : 'bg-slate-950/60 border-white/5 text-slate-500'}`}>
                <div className="flex items-center gap-2 font-bold">
                  <span className={traceProgress >= 78 ? 'text-emerald-400' : ''}>{traceProgress >= 78 ? '✓' : '3.'}</span>
                  <span>Privacy Pools & Mixers</span>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-1">Railgun / Tornado anonymity unmasking</div>
              </div>

              <div className={`p-2.5 rounded-xl border transition-all ${traceProgress >= 92 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' : 'bg-slate-950/60 border-white/5 text-slate-500'}`}>
                <div className="flex items-center gap-2 font-bold">
                  <span className={traceProgress >= 92 ? 'text-emerald-400' : ''}>{traceProgress >= 92 ? '✓' : '4.'}</span>
                  <span>VASP KYC Off-Ramps</span>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-1">Terminal exchange custody resolution</div>
              </div>
            </div>

            {/* Real-time Ticker / Terminal Log */}
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[10.5px] text-cyan-300 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold">&gt;</span>
                <span className="truncate">{traceStepText || 'Synthesizing graph topology...'}</span>
              </div>
              <span className="w-2 h-4 bg-cyan-400 animate-pulse ml-2 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForensicWorkstation(props: { caseId: string }) {
  return (
    <ForensicErrorBoundary>
      <ForensicWorkstationInner {...props} />
    </ForensicErrorBoundary>
  );
}

