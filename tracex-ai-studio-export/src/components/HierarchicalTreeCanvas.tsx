import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  TreeCategoryCard, 
  TerminalEntityNode, 
  CentralAnchorRoot, 
  VisMode 
} from '../types/forensics';
import { 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight,
  Maximize2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface HierarchicalTreeCanvasProps {
  rootAnchor: CentralAnchorRoot;
  categories: TreeCategoryCard[];
  activeCategoryId: 'peel' | 'mixer' | 'gas' | 'vasp';
  onSelectCategory: (id: 'peel' | 'mixer' | 'gas' | 'vasp') => void;
  selectedTerminalNode: TerminalEntityNode | null;
  onSelectTerminalNode: (node: TerminalEntityNode) => void;
  visMode: VisMode;
  onChangeVisMode: (mode: VisMode) => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
  onOpenSection91: (node: TerminalEntityNode) => void;
  onViewEvidence: (evidenceId?: string) => void;
  highlightedTxHash?: string | null;
  onFocusRoot: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onResetView: () => void;
}

export const HierarchicalTreeCanvas: React.FC<HierarchicalTreeCanvasProps> = ({
  rootAnchor,
  categories,
  activeCategoryId,
  onSelectCategory,
  selectedTerminalNode,
  onSelectTerminalNode,
  visMode,
  onChangeVisMode,
  expandAll,
  onToggleExpandAll,
  onOpenSection91,
  onViewEvidence,
  highlightedTxHash,
  onFocusRoot,
  zoom,
  onZoomChange,
  onResetView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 10 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Auto-fit to viewport bounds
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      const optimalZoom = rect.width < 1200 ? 0.78 : rect.width < 1440 ? 0.88 : 0.95;
      onZoomChange(optimalZoom);
      setPan({ x: 20, y: 15 });
    }
  }, [onZoomChange]);

  useEffect(() => {
    fitToView();
    window.addEventListener('resize', fitToView);
    return () => window.removeEventListener('resize', fitToView);
  }, [fitToView]);

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.id === 'spatial-svg-root' || target.id === 'canvas-bg-dragarea') {
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
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Node Geometry Coordinates based on VisMode (Tree vs Graph Constellation)
  const isForceMode = visMode === 'graph';

  const rootCoords = useMemo(() => {
    if (isForceMode) {
      return { x: 300, y: 390 };
    }
    return { x: 190, y: 400 };
  }, [isForceMode]);

  // Mid-Tier Bridge Card positions
  const categoryPositions = useMemo(() => {
    if (isForceMode) {
      // Force Graph Constellation Layout (Curved orbital placement)
      const positions = [
        { x: 580, y: 150 },
        { x: 670, y: 310 },
        { x: 670, y: 470 },
        { x: 580, y: 630 },
      ];
      return categories.map((cat, idx) => ({
        ...cat,
        x: positions[idx % positions.length].x,
        y: positions[idx % positions.length].y,
        width: 250,
        height: 94,
      }));
    }

    // Default: Hierarchical Radial Dendrogram / Tree Branching
    const catX = 570;
    const spacing = 150;
    const startY = 175;
    return categories.map((cat, idx) => ({
      ...cat,
      x: catX,
      y: startY + idx * spacing,
      width: 255,
      height: 96,
    }));
  }, [categories, isForceMode]);

  // Terminal Node positions
  const terminalPositions = useMemo(() => {
    const termX = isForceMode ? 1020 : 990;
    const width = 290;
    const height = 110;

    if (expandAll) {
      let currentY = 100;
      const result: { node: TerminalEntityNode; catId: string; x: number; y: number; width: number; height: number; parentY: number }[] = [];
      categoryPositions.forEach((cat) => {
        cat.terminalNodes.forEach((node) => {
          result.push({
            node,
            catId: cat.id,
            x: termX,
            y: currentY,
            width,
            height,
            parentY: cat.y,
          });
          currentY += 124;
        });
      });
      return result;
    }

    // Single active category mode
    const activeCat = categoryPositions.find((c) => c.id === activeCategoryId) || categoryPositions[3];
    const nodes = activeCat.terminalNodes;
    const totalNodes = nodes.length;
    
    const startY = Math.max(120, activeCat.y - ((totalNodes - 1) * 140) / 2);

    return nodes.map((node, idx) => ({
      node,
      catId: activeCat.id,
      x: termX,
      y: startY + idx * 140,
      width,
      height,
      parentY: activeCat.y,
    }));
  }, [categoryPositions, activeCategoryId, expandAll, isForceMode]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 h-full w-full bg-[#090B0E] overflow-hidden select-none cursor-grab active:cursor-grabbing spatial-canvas-bg"
    >
      {/* Background Drag Hit Area */}
      <div id="canvas-bg-dragarea" className="absolute inset-0 z-0 pointer-events-auto" />

      {/* Subtle Ambient Radial Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(circle at 25% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%), radial-gradient(circle at 75% 60%, rgba(0, 242, 254, 0.05) 0%, transparent 50%)'
        }}
      />

      {/* Floating Canvas Controls (Bottom Left) */}
      <div className="absolute bottom-5 left-6 z-30 flex items-center gap-1.5 p-1 rounded-full bg-[#101217]/90 border border-white/10 backdrop-blur-md shadow-2xl">
        <button
          onClick={() => onZoomChange(Math.min(zoom + 0.12, 2.0))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A09D95] hover:text-[#EEEBE2] hover:bg-white/10 transition cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => onZoomChange(Math.max(zoom - 0.12, 0.45))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A09D95] hover:text-[#EEEBE2] hover:bg-white/10 transition cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={fitToView}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A09D95] hover:text-[#EEEBE2] hover:bg-white/10 transition cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <span className="font-mono text-[10px] text-[#71747E] pr-2.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* SVG Canvas for High-Precision Fiber-Optic Curved Lines & Central Planetary Orb */}
      <svg
        id="spatial-svg-root"
        className="w-full h-full relative z-10 pointer-events-auto overflow-visible"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <defs>
          {/* Neon Glow Filters */}
          <filter id="neon-glow-violet" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="neon-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="fiber-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="heat-thermal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" />
          </filter>

          {/* Gradients */}
          <radialGradient id="orb-inner-sphere" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#8B5CF6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="1" />
          </radialGradient>

          <radialGradient id="atmospheric-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#00F2FE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#090B0E" stopOpacity="0" />
          </radialGradient>

          {/* Category Connector Gradients */}
          <linearGradient id="grad-root-to-peel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="grad-root-to-mixer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="grad-root-to-gas" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="grad-root-to-vasp" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="grad-fiber-fanout" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 1. TAINT HEATMAP MODE OVERLAY (Thermal Density) */}
        {visMode === 'heat' && (
          <g className="thermal-heat-layer pointer-events-none">
            <circle cx={rootCoords.x} cy={rootCoords.y} r={140} fill="#EF4444" opacity={0.25} filter="url(#heat-thermal-glow)" />
            {categoryPositions.map((cat) => (
              <circle
                key={`heat-${cat.id}`}
                cx={cat.x + cat.width / 2}
                cy={cat.y + cat.height / 2}
                r={cat.id === 'vasp' ? 120 : 90}
                fill={cat.id === 'vasp' ? '#F59E0B' : cat.id === 'mixer' ? '#A855F7' : '#00F2FE'}
                opacity={0.22}
                filter="url(#heat-thermal-glow)"
              />
            ))}
            {terminalPositions.map((term, i) => (
              <circle
                key={`heat-term-${i}`}
                cx={term.x + term.width / 2}
                cy={term.y + term.height / 2}
                r={term.node.amountEth > 3 ? 110 : 80}
                fill="#EF4444"
                opacity={0.2}
                filter="url(#heat-thermal-glow)"
              />
            ))}
          </g>
        )}

        {/* 2. ROOT-TO-CATEGORY SMOOTH CUBIC BEZIER CONDUITS */}
        <g className="root-to-category-conduits">
          {categoryPositions.map((cat) => {
            const isCatActive = activeCategoryId === cat.id;
            const isDimmed = !isCatActive && !expandAll;

            const startX = rootCoords.x + 48;
            const startY = rootCoords.y;
            const targetX = cat.x;
            const targetY = cat.y + cat.height / 2;

            const dx = targetX - startX;
            const cx1 = startX + dx * 0.46;
            const cy1 = startY;
            const cx2 = targetX - dx * 0.46;
            const cy2 = targetY;

            const pathD = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetX} ${targetY}`;

            let strokeColor = 'url(#grad-root-to-vasp)';
            if (cat.id === 'peel') strokeColor = 'url(#grad-root-to-peel)';
            if (cat.id === 'mixer') strokeColor = 'url(#grad-root-to-mixer)';
            if (cat.id === 'gas') strokeColor = 'url(#grad-root-to-gas)';

            return (
              <g 
                key={`conduit-${cat.id}`}
                className="cursor-pointer"
                onClick={() => onSelectCategory(cat.id)}
                opacity={isDimmed ? 0.16 : 1}
                style={{ transition: 'opacity 0.28s ease' }}
              >
                {/* Thick Invisible Hover Corridor */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth={24} />

                {/* Ambient Translucent Pipe Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isCatActive ? cat.accentColor : '#1E2330'}
                  strokeWidth={isCatActive ? 8 : 4}
                  strokeLinecap="round"
                  opacity={isCatActive ? 0.35 : 0.2}
                  filter={isCatActive ? 'url(#fiber-glow)' : undefined}
                />

                {/* Primary Radiant Core Conduit */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isCatActive ? 2.8 : 1.6}
                  strokeLinecap="round"
                  opacity={isCatActive ? 1 : 0.65}
                />

                {/* Living Travelling Micro-Photon Particles */}
                {isCatActive && (
                  <>
                    <circle r={2.8} fill="#FFFFFF" opacity={0.95} filter="url(#neon-glow-cyan)">
                      <animateMotion path={pathD} dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <circle r={2.0} fill={cat.accentColor} opacity={0.8}>
                      <animateMotion path={pathD} dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* 3. CATEGORY-TO-TERMINAL FIBER-OPTIC FAN-OUT TENTACLES */}
        <g className="category-to-terminal-tentacles">
          {terminalPositions.map((term, idx) => {
            const isSelected = selectedTerminalNode?.id === term.node.id;
            const parentCat = categoryPositions.find((c) => c.id === term.catId);
            if (!parentCat) return null;

            const startX = parentCat.x + parentCat.width;
            const startY = parentCat.y + parentCat.height / 2;
            const targetX = term.x;
            const targetY = term.y + term.height / 2;

            const dx = targetX - startX;
            const cx1 = startX + dx * 0.52;
            const cy1 = startY;
            const cx2 = targetX - dx * 0.48;
            const cy2 = targetY;

            const pathD = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetX} ${targetY}`;

            return (
              <g
                key={`fanout-${term.node.id}-${idx}`}
                className="cursor-pointer"
                onClick={() => onSelectTerminalNode(term.node)}
              >
                {/* Wide invisible click target */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} />

                {/* Fiber-Optic Translucent Conduit Ribbon */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#F59E0B' : parentCat.accentColor}
                  strokeWidth={isSelected ? 6 : 3.2}
                  strokeLinecap="round"
                  opacity={isSelected ? 0.35 : 0.18}
                  filter={isSelected ? 'url(#fiber-glow)' : undefined}
                />

                {/* Laser-Sharp Core Fiber Strand */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#F59E0B' : 'url(#grad-fiber-fanout)'}
                  strokeWidth={isSelected ? 2.4 : 1.4}
                  strokeLinecap="round"
                  opacity={isSelected ? 1 : 0.75}
                />

                {/* Streaming Light Photon Pulses */}
                <circle
                  r={isSelected ? 2.5 : 1.8}
                  fill={isSelected ? '#FFFFFF' : '#F59E0B'}
                  opacity={0.9}
                >
                  <animateMotion
                    path={pathD}
                    dur={`${2.2 + (idx % 3) * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </g>

        {/* 4. CENTRAL PLANETARY ANCHOR NODE (The Root Fraud Siphon) */}
        <g 
          className="central-planetary-anchor cursor-pointer"
          transform={`translate(${rootCoords.x}, ${rootCoords.y})`}
          onClick={onFocusRoot}
        >
          {/* Atmospheric Outer Glow Halo */}
          <circle
            r={76}
            fill="url(#atmospheric-halo)"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />

          {/* Outer Orbital Ring 1 (Clockwise Rotation, Dashed) */}
          <circle
            r={54}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={1.2}
            strokeDasharray="4 6"
            opacity={0.65}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="24s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Micro-Satellite Particles on Ring 1 */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="24s"
              repeatCount="indefinite"
            />
            <circle cx={54} cy={0} r={2.5} fill="#00F2FE" filter="url(#neon-glow-cyan)" />
            <circle cx={-54} cy={0} r={1.8} fill="#8B5CF6" />
          </g>

          {/* Inner Orbital Ring 2 (Counter-Clockwise Rotation, Fine Dashed) */}
          <circle
            r={44}
            fill="none"
            stroke="#00F2FE"
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.5}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="16s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Micro-Satellite Particle on Ring 2 */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="16s"
              repeatCount="indefinite"
            />
            <circle cx={0} cy={44} r={2} fill="#FFFFFF" />
          </g>

          {/* Glowing Translucent Atmospheric Shell */}
          <circle
            r={34}
            fill="#8B5CF6"
            opacity={0.25}
            filter="url(#neon-glow-violet)"
          />

          {/* Central Multi-Layered Glowing Spherical Orb */}
          <circle
            r={28}
            fill="url(#orb-inner-sphere)"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            filter="url(#neon-glow-cyan)"
          />

          {/* Core Specular Shimmer */}
          <circle
            cx={-8}
            cy={-8}
            r={7}
            fill="#FFFFFF"
            opacity={0.4}
            filter="url(#neon-glow-cyan)"
          />

          {/* Root Fraud Label Card Underneath (High Contrast, Official Typography) */}
          <g transform="translate(0, 52)">
            <rect
              x={-110}
              y={0}
              width={220}
              height={48}
              rx={8}
              fill="#0E1015"
              stroke="rgba(139, 92, 246, 0.4)"
              strokeWidth={1}
              filter="drop-shadow(0 4px 14px rgba(0,0,0,0.8))"
            />
            <text
              x={0}
              y={18}
              textAnchor="middle"
              fill="#EEEBE2"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans"
              letterSpacing="0.2"
            >
              {rootAnchor.label}
            </text>
            <text
              x={0}
              y={34}
              textAnchor="middle"
              fill="#8B5CF6"
              fontSize="9"
              fontFamily="JetBrains Mono"
              letterSpacing="0.4"
            >
              {rootAnchor.timestamp.slice(0, 17)} · DRAIN ROOT
            </text>
          </g>
        </g>
      </svg>

      {/* HTML OVERLAY LAYER FOR MID-TIER CATEGORICAL BRIDGE CARDS (Razor-Sharp Interactive Cards) */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {categoryPositions.map((cat) => {
          const isSelected = activeCategoryId === cat.id;
          const isDimmed = !isSelected && !expandAll;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              onMouseEnter={() => setHoveredCardId(cat.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                position: 'absolute',
                left: `${cat.x}px`,
                top: `${cat.y}px`,
                width: `${cat.width}px`,
                height: `${cat.height}px`,
                opacity: isDimmed ? 0.35 : 1,
                borderColor: isSelected ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected
                  ? '0 0 24px rgba(245, 158, 11, 0.28), 0 8px 32px rgba(0, 0, 0, 0.7)'
                  : '0 4px 20px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="pointer-events-auto rounded-xl bg-[#101217]/95 backdrop-blur-xl border p-3 flex flex-col justify-between cursor-pointer group hover:border-[#F59E0B]/60"
            >
              {/* Card Header with Category Title & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: cat.accentColor }} 
                    />
                    <h3 className="font-sans font-semibold text-xs text-[#EEEBE2] group-hover:text-[#FFFFFF] transition">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-[#71747E] font-sans mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span 
                    className="px-2 py-0.5 rounded text-[9.5px] font-mono font-medium border"
                    style={{
                      backgroundColor: `${cat.accentColor}15`,
                      color: cat.accentColor,
                      borderColor: `${cat.accentColor}30`,
                    }}
                  >
                    {cat.badge}
                  </span>
                  <span 
                    className="text-[9px] font-mono tracking-wider uppercase font-semibold"
                    style={{ color: cat.severityColor }}
                  >
                    {cat.severity}
                  </span>
                </div>
              </div>

              {/* Card Footer Metric & Terminal Count */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8B83]">
                  {cat.terminalNodes.length} Terminal {cat.terminalNodes.length === 1 ? 'Target' : 'Targets'}
                </span>
                <span className="text-[#F59E0B] flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>{isSelected ? 'ACTIVE BRANCH' : 'EXPLORE'}</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}

        {/* HTML OVERLAY LAYER FOR TERMINAL ENTITY CARDS */}
        {terminalPositions.map((term) => {
          const isSelected = selectedTerminalNode?.id === term.node.id;

          return (
            <div
              key={term.node.id}
              onClick={() => onSelectTerminalNode(term.node)}
              style={{
                position: 'absolute',
                left: `${term.x}px`,
                top: `${term.y}px`,
                width: `${term.width}px`,
                height: `${term.height}px`,
                borderColor: isSelected ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected
                  ? '0 0 28px rgba(245, 158, 11, 0.35), 0 8px 32px rgba(0, 0, 0, 0.8)'
                  : '0 4px 18px rgba(0, 0, 0, 0.55)',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className="pointer-events-auto rounded-xl bg-[#101217]/95 backdrop-blur-xl border p-3 flex flex-col justify-between cursor-pointer group hover:border-[#F59E0B]/70"
            >
              {/* Header: Title, Tier Badge & Risk */}
              <div className="flex items-start justify-between gap-2">
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: term.node.statusColor }} 
                    />
                    <h4 className="font-sans font-bold text-xs text-[#EEEBE2] group-hover:text-[#FFFFFF] truncate">
                      {term.node.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[9.5px] text-[#71747E]">
                    <span className="truncate max-w-[150px]">{term.node.address}</span>
                    <button
                      onClick={(e) => handleCopy(term.node.address, e)}
                      className="text-[#60636C] hover:text-[#EEEBE2] transition cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedAddress === term.node.address ? (
                        <Check className="w-2.5 h-2.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/5 text-[#EEEBE2] border border-white/10">
                    {term.node.badgeTier}
                  </span>
                  <span className="text-[9px] font-mono text-[#D97706] mt-0.5 font-semibold">
                    {term.node.riskRating}% RISK
                  </span>
                </div>
              </div>

              {/* Middle Financial Inflow Metric */}
              <div className="flex items-baseline justify-between py-1 border-t border-b border-white/5 font-mono">
                <div>
                  <span className="text-xs font-bold text-[#EEEBE2]">
                    {term.node.amountEth} ETH
                  </span>
                  <span className="text-[9.5px] text-[#8E8B83] ml-1.5 font-sans">
                    ({term.node.amountInr})
                  </span>
                </div>

                <div className="text-[9px] font-mono text-[#71747E]">
                  Hop 0{term.node.hops}
                </div>
              </div>

              {/* Footer Status & Action Trigger */}
              <div className="flex items-center justify-between text-[9.5px] font-mono">
                <span 
                  className="font-medium truncate max-w-[170px]"
                  style={{ color: term.node.statusColor }}
                >
                  ● {term.node.status}
                </span>

                <span className="text-[#8E8B83] group-hover:text-[#F59E0B] flex items-center gap-1 transition">
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
