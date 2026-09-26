import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  ForensicNode, 
  ForensicEdge, 
  ForensicFinding, 
  VisMode,
  NodeType 
} from '../../types/forensics';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldAlert,
  ShieldCheck,
  FileText,
  Activity,
  Maximize2
} from 'lucide-react';

interface NetworkVisualizationProps {
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

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  selectedEdgeId,
  onSelectEdge,
  activeFinding,
  currentHopLimit,
  highlightedFindingId,
  onViewEvidence,
  onOpenSection91Notice,
}) => {
  const [visMode, setVisMode] = useState<VisMode>('flow');
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<ForensicNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<ForensicEdge | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter nodes & edges by current timeline hop limit
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => n.hop <= currentHopLimit);
  }, [nodes, currentHopLimit]);

  const visibleEdges = useMemo(() => {
    const nodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(e => 
      e.hop <= currentHopLimit && 
      nodeIds.has(e.source) && 
      nodeIds.has(e.target)
    );
  }, [edges, currentHopLimit, visibleNodes]);

  // Compute full ancestry and descendant path when a node is selected
  const tracedPathData = useMemo(() => {
    if (!selectedNode) {
      return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
    }

    const nodeIds = new Set<string>([selectedNode.id]);
    const edgeIds = new Set<string>();

    // 1. Trace upstream to origins (BFS backward)
    const queueUp = [selectedNode.id];
    const visitedUp = new Set<string>([selectedNode.id]);
    while (queueUp.length > 0) {
      const currentId = queueUp.shift()!;
      edges.forEach(e => {
        if (e.target === currentId && !visitedUp.has(e.source)) {
          visitedUp.add(e.source);
          nodeIds.add(e.source);
          edgeIds.add(e.id);
          queueUp.push(e.source);
        } else if (e.target === currentId) {
          edgeIds.add(e.id);
        }
      });
    }

    // 2. Trace downstream to exits (BFS forward)
    const queueDown = [selectedNode.id];
    const visitedDown = new Set<string>([selectedNode.id]);
    while (queueDown.length > 0) {
      const currentId = queueDown.shift()!;
      edges.forEach(e => {
        if (e.source === currentId && !visitedDown.has(e.target)) {
          visitedDown.add(e.target);
          nodeIds.add(e.target);
          edgeIds.add(e.id);
          queueDown.push(e.target);
        } else if (e.source === currentId) {
          edgeIds.add(e.id);
        }
      });
    }

    return { nodeIds, edgeIds };
  }, [selectedNode, edges]);

  // Edges highlighted by active finding
  const findingEdgeIds = useMemo(() => {
    if (!activeFinding) return new Set<string>();
    return new Set<string>(activeFinding.matchedEdgeIds);
  }, [activeFinding]);

  const findingNodeIds = useMemo(() => {
    if (!activeFinding) return new Set<string>();
    return new Set<string>(activeFinding.matchedNodeIds);
  }, [activeFinding]);

  // Auto-fit bounds on mount & container resize
  const autoFitBounds = useCallback(() => {
    if (!containerRef.current || visibleNodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const graphWidth = maxX - minX || 1200;
    const graphHeight = maxY - minY || 500;
    const padX = 75;
    const padY = 65;

    const scaleX = (rect.width - padX * 2) / graphWidth;
    const scaleY = (rect.height - padY * 2) / graphHeight;
    const optimalZoom = Math.max(0.55, Math.min(1.15, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetPanX = rect.width / 2 - centerX * optimalZoom;
    const targetPanY = rect.height / 2 - centerY * optimalZoom;

    setZoom(optimalZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, [nodes, visibleNodes]);

  useEffect(() => {
    autoFitBounds();
    window.addEventListener('resize', autoFitBounds);
    return () => window.removeEventListener('resize', autoFitBounds);
  }, [autoFitBounds]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.id === 'canvas-bg-hitarea') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.4));
  const handleReset = () => {
    autoFitBounds();
    onSelectNode(null);
    onSelectEdge(null);
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node Semantic Styling
  const getNodeColor = (node: ForensicNode) => {
    if (node.type === 'culprit') return '#EF4444'; // Muted Red Exploit Anchor
    if (node.type === 'victim') return '#4D88FF'; // Origin Asset Blue
    if (node.type === 'mixer') return '#A855F7'; // Privacy / Mixer Violet
    if (node.type === 'vasp') return '#10B981'; // Verified Exit Emerald
    if (node.type === 'mule' && node.taintRatio > 90) return '#D97706'; // Tainted Peel Amber
    return '#3E4351'; // Quiet Neutral Charcoal
  };

  const getNodeRadius = (node: ForensicNode) => {
    if (node.id === 'node-culprit-exploit') return 20;
    if (node.type === 'victim') return 16;
    if (node.type === 'mixer' || node.type === 'vasp') return 13;
    if (node.id === 'node-peel-origin' || node.id === 'node-rapid-passthrough') return 12;
    if (node.type === 'gas_sponsor') return 8;
    return 6;
  };

  // Stage Divider positions (X coordinates corresponding to investigation phases)
  const stageDividers = [
    { x: 235, label: '00 / FRAUD ORIGIN', subtitle: 'Aegis Treasury Drain' },
    { x: 585, label: '01 / RAPID TRANSIT', subtitle: 'Sub-minute Passthrough' },
    { x: 880, label: '02 / PEEL & FAN-OUT', subtitle: 'Tranche Dispersal' },
    { x: 1090, label: '03 / SHIELDING', subtitle: 'ZK Pools & Swaps' },
    { x: 1330, label: '04 / CUSTODIAL EXITS', subtitle: 'KYC Exchange Desks' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 h-full w-full bg-[#07080A] spatial-canvas-bg overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* 1. Canvas Background Hit Area for clearing selection */}
      <div 
        id="canvas-bg-hitarea" 
        onClick={() => {
          onSelectNode(null);
          onSelectEdge(null);
        }}
        className="absolute inset-0 z-0 pointer-events-auto"
      />

      {/* 2. Top Editorial Phase Guide */}
      <div className="absolute top-3.5 left-5 z-20 flex items-center gap-6 font-mono text-[9px] text-[#555864] tracking-widest pointer-events-none select-none">
        <span className="text-[#8E8B83] font-semibold">FLOW TIMELINE</span>
        <span className="text-[#353842]">/</span>
        <span>ORIGIN (HOP 0)</span>
        <span className="text-[#353842]">→</span>
        <span>PASSTHROUGH (HOP 1)</span>
        <span className="text-[#353842]">→</span>
        <span>PEEL BRANCHES (HOP 2)</span>
        <span className="text-[#353842]">→</span>
        <span>PRIVACY MIXERS (HOP 3)</span>
        <span className="text-[#353842]">→</span>
        <span>EXCHANGE EXITS (HOP 4)</span>
      </div>

      {/* 3. Minimal Mode Switcher (Flow / Graph / Heat) */}
      <div className="absolute top-3.5 right-5 z-20 flex items-center p-0.5 rounded bg-[#0A0C10] border border-[#171922] shadow-sm">
        <button
          onClick={() => setVisMode('flow')}
          className={`px-2.5 py-1 rounded text-[10.5px] font-mono transition cursor-pointer ${
            visMode === 'flow'
              ? 'bg-[#141720] text-[#EEEBE2] font-semibold shadow-sm'
              : 'text-[#626672] hover:text-[#8E929E]'
          }`}
          title="Curved stream ribbons with living particle movement"
        >
          STREAM FLOW
        </button>
        <button
          onClick={() => setVisMode('graph')}
          className={`px-2.5 py-1 rounded text-[10.5px] font-mono transition cursor-pointer ${
            visMode === 'graph'
              ? 'bg-[#141720] text-[#EEEBE2] font-semibold shadow-sm'
              : 'text-[#626672] hover:text-[#8E929E]'
          }`}
          title="Relational cluster topology"
        >
          TOPOLOGY
        </button>
        <button
          onClick={() => setVisMode('heat')}
          className={`px-2.5 py-1 rounded text-[10.5px] font-mono transition cursor-pointer ${
            visMode === 'heat'
              ? 'bg-[#141720] text-[#EEEBE2] font-semibold shadow-sm'
              : 'text-[#626672] hover:text-[#8E929E]'
          }`}
          title="Taint velocity and volume density heatmap"
        >
          VELOCITY HEAT
        </button>
      </div>

      {/* 4. Minimal Floating Camera Controls */}
      <div className="absolute bottom-4 left-5 z-20 flex items-center gap-1 p-0.5 rounded bg-[#0A0C10] border border-[#171922] shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded text-[#626672] hover:text-[#EEEBE2] hover:bg-[#13161F] transition cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded text-[#626672] hover:text-[#EEEBE2] hover:bg-[#13161F] transition cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Auto-Fit Full Network"
          className="p-1.5 rounded text-[#626672] hover:text-[#EEEBE2] hover:bg-[#13161F] transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Active Focus Indicator Pill */}
      {selectedNode && (
        <div className="absolute top-12 left-5 z-20 flex items-center gap-2 px-2.5 py-1 rounded bg-[#0E1118]/90 border border-[#202533] backdrop-blur-sm text-xs font-mono">
          <span className="text-[#8E8B83]">TRACE PATH:</span>
          <span className="text-[#EEEBE2] font-semibold">{selectedNode.label}</span>
          <button
            onClick={() => onSelectNode(null)}
            className="text-[#626672] hover:text-[#EEEBE2] ml-1.5 text-xs transition cursor-pointer"
            title="Clear Path Isolation"
          >
            × Clear
          </button>
        </div>
      )}

      {/* 6. MAIN INTERACTIVE SVG SPATIAL NETWORK */}
      <svg
        ref={svgRef}
        className="w-full h-full relative z-10 pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.16s ease-out'
        }}
      >
        <defs>
          {/* Subtle Ambient Focus Glow */}
          <filter id="focus-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep Velocity Heat Blur */}
          <filter id="heat-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="32" />
          </filter>

          {/* Gradients */}
          <linearGradient id="stream-siphon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4D88FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="stream-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="stream-mixer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="stream-vasp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="stream-neutral" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#252A36" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2C3342" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* 1. BACKGROUND PHASE REFERENCE GUIDES & COORDINATE HAIRLINES */}
        <g className="phase-guides-layer pointer-events-none select-none opacity-40">
          {stageDividers.map((div, i) => (
            <g key={i}>
              <line
                x1={div.x}
                y1={100}
                x2={div.x}
                y2={720}
                stroke="#171A22"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={div.x}
                y={90}
                fill="#4D515E"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                letterSpacing="1"
              >
                {div.label}
              </text>
            </g>
          ))}
        </g>

        {/* 2. HEAT DENSITY POOLS (When visMode === 'heat') */}
        {visMode === 'heat' && (
          <g className="heat-density-layer pointer-events-none">
            {visibleNodes.map(node => {
              if (node.balanceEth < 2 && node.type !== 'culprit') return null;
              const intensity = Math.min(1, node.taintRatio / 100);
              const r = 50 + (node.balanceEth / 840) * 110;
              const heatColor = node.type === 'culprit' ? '#EF4444' : node.type === 'mixer' ? '#A855F7' : '#D97706';

              return (
                <circle
                  key={`heat-${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={heatColor}
                  filter="url(#heat-blur)"
                  opacity={0.32 * intensity}
                />
              );
            })}
          </g>
        )}

        {/* 3. FLOWING ORGANIC CURVED STREAM EDGES */}
        <g className="edges-layer">
          {visibleEdges.map(edge => {
            const s = nodes.find(n => n.id === edge.source);
            const t = nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;

            // Organic Horizontal Stream Inflection Curve
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const cx1 = s.x + dx * 0.48;
            const cy1 = s.y;
            const cx2 = s.x + dx * 0.52;
            const cy2 = t.y;
            const pathData = `M ${s.x} ${s.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${t.x} ${t.y}`;

            const isSelectedEdge = selectedEdgeId === edge.id;
            const isTraced = selectedNode && tracedPathData.edgeIds.has(edge.id);
            const isFindingHighlighted = findingEdgeIds.has(edge.id);

            // Progressive Dimming: when a node or finding is selected, unrelated streams drop to whisper opacity
            const isDimmed = (selectedNode && !isTraced) || (activeFinding && !isFindingHighlighted && !selectedNode);

            // Volumetric stream width mapping
            let baseWidth = 1.4;
            if (edge.amountEth >= 800) baseWidth = 7.5;
            else if (edge.amountEth >= 400) baseWidth = 5.5;
            else if (edge.amountEth >= 200) baseWidth = 4.2;
            else if (edge.amountEth >= 80) baseWidth = 3.2;
            else if (edge.amountEth >= 20) baseWidth = 2.4;
            else if (edge.amountEth >= 5) baseWidth = 1.8;

            // Semantic Color Selection
            let strokeColor = 'url(#stream-neutral)';
            if (edge.rulesTriggered.includes('R5') || t.type === 'mixer') {
              strokeColor = 'url(#stream-mixer)';
            } else if (edge.rulesTriggered.includes('R8') || t.type === 'vasp') {
              strokeColor = 'url(#stream-vasp)';
            } else if (edge.rulesTriggered.includes('R1') || edge.id === 'edge-theft-siphon') {
              strokeColor = 'url(#stream-siphon)';
            } else if (edge.amountEth > 15) {
              strokeColor = 'url(#stream-amber)';
            }

            if (isFindingHighlighted) {
              strokeColor = '#F59E0B';
              baseWidth = Math.max(baseWidth, 4.5);
            } else if (isTraced || isSelectedEdge) {
              strokeColor = '#4FACFE';
              baseWidth = Math.max(baseWidth, 4.0);
            }

            return (
              <g
                key={edge.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEdge(edge.id);
                }}
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
                className="cursor-pointer group"
                opacity={isDimmed ? 0.07 : 1}
                style={{ transition: 'opacity 0.22s ease' }}
              >
                {/* Wide invisible click/hover hit area */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={18}
                />

                {/* Subsurface Translucent Ghost Conduit */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isTraced || isFindingHighlighted ? '#4FACFE' : '#222733'}
                  strokeWidth={baseWidth + 5}
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.05 : isTraced ? 0.25 : 0.1}
                />

                {/* Main Dynamic Stream Ribbon */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={baseWidth}
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.1 : isTraced || isFindingHighlighted ? 1 : 0.85}
                  filter={isTraced || isFindingHighlighted ? 'url(#focus-glow)' : undefined}
                />

                {/* FLOW MODE: Travelling Liquid Flow Particles */}
                {visMode === 'flow' && !isDimmed && (
                  <>
                    <circle
                      r={edge.amountEth > 100 ? 2.5 : 1.8}
                      fill={isFindingHighlighted ? '#F59E0B' : isTraced ? '#FFFFFF' : '#D97706'}
                      opacity={0.9}
                    >
                      <animateMotion
                        path={pathData}
                        dur={`${Math.max(1.8, 5.2 - Math.log10(edge.amountEth + 1))}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Staggered secondary pulse for high-volume streams */}
                    {edge.amountEth > 100 && (
                      <circle
                        r={1.8}
                        fill={isTraced ? '#FFFFFF' : '#D97706'}
                        opacity={0.65}
                      >
                        <animateMotion
                          path={pathData}
                          begin="1.2s"
                          dur={`${Math.max(1.8, 5.2 - Math.log10(edge.amountEth + 1))}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </>
                )}

                {/* Contextual Edge Volume Label on Trace or Selection */}
                {(isTraced || isFindingHighlighted || isSelectedEdge || hoveredEdge?.id === edge.id) && (
                  <text
                    x={(s.x + t.x) / 2}
                    y={(s.y + t.y) / 2 - 6}
                    fill="#EEEBE2"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    className="pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                  >
                    {edge.amountEth} ETH
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 4. NODES EMBEDDED NATURALLY IN NETWORK */}
        <g className="nodes-layer">
          {visibleNodes.map(node => {
            const radius = getNodeRadius(node);
            const isSelected = selectedNode?.id === node.id;
            const isTraced = selectedNode && tracedPathData.nodeIds.has(node.id);
            const isFindingMatch = activeFinding && findingNodeIds.has(node.id);
            const isDimmed = (selectedNode && !isTraced) || (activeFinding && !isFindingMatch && !selectedNode);
            const color = getNodeColor(node);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
                opacity={isDimmed ? 0.08 : 1}
                style={{ transition: 'opacity 0.22s ease' }}
              >
                {/* Selection Concentric Halo */}
                {isSelected && (
                  <>
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#4FACFE"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                      opacity={0.85}
                    />
                    <circle
                      r={radius + 15}
                      fill="#4FACFE"
                      opacity={0.06}
                    />
                  </>
                )}

                {/* Node Target Rings for Verified Exits & Mixers */}
                {node.type === 'vasp' && (
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={0.8}
                    opacity={0.4}
                  />
                )}
                {node.type === 'mixer' && (
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth={0.8}
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                )}
                {node.type === 'culprit' && (
                  <circle
                    r={radius + 5}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                )}

                {/* Base Node Disc */}
                <circle
                  r={radius}
                  fill="#0B0D12"
                  stroke={isSelected ? '#FFFFFF' : color}
                  strokeWidth={isSelected ? 2 : node.id === 'node-culprit-exploit' ? 2 : 1.2}
                />

                {/* Core Semantic Dot */}
                <circle
                  r={Math.max(2.2, radius * 0.35)}
                  fill={color}
                  opacity={isSelected ? 1 : 0.9}
                />

                {/* Label (Contextual progressive disclosure) */}
                {(radius > 8 || isSelected || isTraced || isFindingMatch || hoveredNode?.id === node.id) && (
                  <text
                    y={radius + 13}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : isTraced ? '#EEEBE2' : '#CFCBC0'}
                    fontSize={node.id === 'node-culprit-exploit' ? '11' : '9.5'}
                    fontWeight={isSelected ? '600' : '400'}
                    fontFamily="Plus Jakarta Sans"
                    className="select-none pointer-events-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]"
                  >
                    {node.label}
                  </text>
                )}

                {/* Precise Balance Tag */}
                {radius > 10 && (
                  <text
                    y={radius + 23}
                    textAnchor="middle"
                    fill="#6C707C"
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    className="select-none pointer-events-none"
                  >
                    {node.balanceEth} ETH
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* 7. HOVER TOOLTIP (Shows metadata cleanly near cursor) */}
      {hoveredNode && !selectedNode && (
        <div
          className="fixed z-40 pointer-events-none rounded bg-[#0A0C10]/95 backdrop-blur-md border border-[#1E232E] px-3 py-2 text-xs font-mono shadow-2xl space-y-1 text-[#EEEBE2]"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y + 16}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3 text-[10px] text-[#8E8B83]">
            <span className="uppercase tracking-wider">{hoveredNode.type.toUpperCase()}</span>
            <span className="text-[#4FACFE]">HOP 0{hoveredNode.hop}</span>
          </div>
          <div className="font-sans font-semibold text-xs text-[#EEEBE2]">
            {hoveredNode.label}
          </div>
          <div className="text-[10px] text-[#6A6E7C] truncate max-w-[190px]">
            {hoveredNode.address}
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-[#171A22] text-[10px]">
            <span>{hoveredNode.balanceEth} ETH</span>
            <span className="text-[#D97706]">Taint: {hoveredNode.taintRatio}%</span>
            <span className="text-[#8E8B83]">{hoveredNode.txCount} txs</span>
          </div>
        </div>
      )}

      {/* 8. CONTEXTUAL FLOATING INSPECTOR CARD (Anchored for selected node) */}
      {selectedNode && (
        <div
          className="absolute z-30 w-72 rounded bg-[#0A0C11]/95 backdrop-blur-md border border-[#1E232F] p-3.5 text-xs shadow-2xl animate-in fade-in duration-150"
          style={{
            top: '4.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between pb-2.5 border-b border-[#161922]">
            <div>
              <div className="font-mono text-[9px] text-[#6A6E7C] uppercase tracking-wider">
                {selectedNode.type === 'vasp' ? 'EXCHANGE OFF-RAMP' : selectedNode.type.toUpperCase()}
              </div>
              <div className="text-sm font-semibold text-[#EEEBE2] mt-0.5">
                {selectedNode.label}
              </div>
              <div className="flex items-center gap-1 mt-0.5 font-mono text-[10px] text-[#6A6E7C]">
                <span className="truncate max-w-[170px]">{selectedNode.address}</span>
                <button
                  onClick={() => handleCopy(selectedNode.address)}
                  className="hover:text-[#EEEBE2] transition cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check className="w-2.5 h-2.5 text-[#10B981]" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => onSelectNode(null)}
              className="text-[#6A6E7C] hover:text-[#EEEBE2] text-sm p-0.5 cursor-pointer"
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Key Forensic Metrics */}
          <div className="grid grid-cols-2 gap-2 py-2.5 font-mono border-b border-[#161922]">
            <div>
              <div className="text-[8.5px] uppercase text-[#6A6E7C]">Balance</div>
              <div className="text-xs font-semibold text-[#EEEBE2] mt-0.5">
                {selectedNode.balanceEth} ETH
              </div>
            </div>
            <div>
              <div className="text-[8.5px] uppercase text-[#6A6E7C]">Tainted</div>
              <div className="text-xs font-semibold text-[#D97706] mt-0.5">
                {selectedNode.taintRatio}%
              </div>
            </div>
            <div>
              <div className="text-[8.5px] uppercase text-[#6A6E7C]">Lineage Hop</div>
              <div className="text-[11px] text-[#8E8B83] mt-0.5">
                Hop 0{selectedNode.hop}
              </div>
            </div>
            <div>
              <div className="text-[8.5px] uppercase text-[#6A6E7C]">First Active</div>
              <div className="text-[10px] text-[#8E8B83] mt-0.5 truncate">
                {selectedNode.firstSeen}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-2.5 flex items-center justify-between font-mono text-[10px]">
            {selectedNode.type === 'vasp' ? (
              <button
                onClick={() => onOpenSection91Notice && onOpenSection91Notice(selectedNode)}
                className="flex items-center gap-1 text-[#10B981] hover:text-[#34D399] transition cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>ISSUE SEC 91 NOTICE</span>
              </button>
            ) : (
              <button
                onClick={() => onViewEvidence(selectedNode.evidenceId)}
                className="flex items-center gap-1 text-[#4FACFE] hover:text-[#70A0FF] transition cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>VIEW EVIDENCE</span>
              </button>
            )}

            <button
              onClick={() => onSelectNode(null)}
              className="text-[#6A6E7C] hover:text-[#EEEBE2] transition cursor-pointer"
            >
              Clear Focus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
