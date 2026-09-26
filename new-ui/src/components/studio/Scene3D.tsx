import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { GraphNodeData, GraphEdgeData, NodeType } from '../../types/graph3d';

export const NODE_CONFIG: Record<NodeType, {
  color: string;
  glowColor: string;
  radius: number;
  label: string;
  shapeDescription: string;
}> = {
  FRAUD_ORIGIN: { 
    color: '#ff2a5f', 
    glowColor: '#ff0033', 
    radius: 1.5, 
    label: 'Fraud / Victim Origin', 
    shapeDescription: 'Cyber Reactor Core' 
  },
  PEEL_CHAIN: { 
    color: '#fbbf24', 
    glowColor: '#f59e0b', 
    radius: 0.75, 
    label: 'Peel Chain', 
    shapeDescription: 'Crypto Data Wafer' 
  },
  MIXER: { 
    color: '#e879f9', 
    glowColor: '#d946ef', 
    radius: 0.85, 
    label: 'Tornado Cash Mixer', 
    shapeDescription: 'Stealth Privacy Chamber' 
  },
  EXCHANGE_EXIT: { 
    color: '#22d3ee', 
    glowColor: '#00f2fe', 
    radius: 0.9, 
    label: 'Exchange Exit (VASP)', 
    shapeDescription: 'VASP Custodial Monolith' 
  },
  GAS_SPONSOR: { 
    color: '#4ade80', 
    glowColor: '#22c55e', 
    radius: 0.65, 
    label: 'Gas Sponsor', 
    shapeDescription: 'Power Fuel Cell' 
  },
  INTERMEDIATE: { 
    color: '#38bdf8', 
    glowColor: '#0284c7', 
    radius: 0.55, 
    label: 'Intermediate Hop', 
    shapeDescription: 'Relay Data Puck' 
  },
};


// Clean Left-to-Right Architectural Pipeline Positions
export const ARCHITECTURAL_POSITIONS: Record<string, [number, number, number]> = {
  // Stage 0: Victim Siphon Anchor & Gas Funders (X: -17)
  'fraud-origin': [-17, 0, 0],
  'gas-1': [-17, 5.0, -2.5],
  'gas-2': [-17, -5.0, 2.5],
  'gas-sponsor': [-17, 5.0, -2.5],

  // Stage 1: Peel Chain 1st Splits (X: -6)
  'peel-1': [-6, 4.4, 2.0],
  'peel-2': [-6, 0, -2.2],
  'inter-1': [-6, -4.4, 1.8],

  // Stage 2: Mixers & Layering Corridor (X: +5)
  'mixer-1': [5, 5.4, 2.2],
  'peel-3': [5, 2.4, -2.0],
  'mixer-2': [5, -1.2, 2.0],
  'inter-2': [5, -4.4, -1.8],
  'inter-3': [5, -7.2, 1.2],

  // Stage 3: Regulated VASP Exits (X: +16)
  'exit-1': [16, 3.4, 1.2],
  'exit-2': [16, -3.4, -1.2],
};

// Node hop mapping for progressive step-by-step playback
export const NODE_HOP_MAP: Record<string, number> = {
  'fraud-origin': -1, // Root victim/culprit anchor is present from the start
  'gas-1': 0,
  'gas-2': 0,
  'gas-sponsor': 0,
  'peel-1': 1,
  'peel-2': 1,
  'inter-1': 1,
  'peel-3': 2,
  'mixer-1': 2,
  'mixer-2': 2,
  'inter-2': 2,
  'inter-3': 2,
  'exit-1': 3,
  'exit-2': 3,
};

export function getNodeHop(nodeId: string, nodeType?: NodeType): number {
  if (NODE_HOP_MAP[nodeId] !== undefined) return NODE_HOP_MAP[nodeId];
  if (nodeId.includes('hop0') || nodeId.includes('sender') || nodeId.includes('fraud-origin')) return -1;
  if (nodeId.includes('hop1') || nodeId.includes('recipient')) return 1;
  if (nodeId.includes('hop2')) return 2;
  if (nodeId.includes('hop3')) return 3;
  if (nodeId.includes('hop4') || nodeId.includes('exit')) return 4;
  switch (nodeType) {
    case 'FRAUD_ORIGIN': return -1;
    case 'GAS_SPONSOR': return 0;
    case 'PEEL_CHAIN': return 1;
    case 'INTERMEDIATE': return 2;
    case 'MIXER': return 3;
    case 'EXCHANGE_EXIT': return 4;
    default: return 1;
  }
}

function computeBasePositions(nodes: GraphNodeData[]): Map<string, THREE.Vector3> {
  const map = new Map<string, THREE.Vector3>();
  const typeCounters: Record<string, number> = {};

  nodes.forEach((n) => {
    // 1. Explicit dynamic position assigned by generator/service
    if (n.position && Array.isArray(n.position) && n.position.length === 3) {
      map.set(n.id, new THREE.Vector3(n.position[0], n.position[1], n.position[2]));
      return;
    }
    // 2. Predefined static positions
    if (ARCHITECTURAL_POSITIONS[n.id]) {
      const coords = ARCHITECTURAL_POSITIONS[n.id];
      map.set(n.id, new THREE.Vector3(coords[0], coords[1], coords[2]));
      return;
    }
    // Dynamic offset layout if custom node ID is passed
    const idx = typeCounters[n.type] || 0;
    typeCounters[n.type] = idx + 1;
    let x = 0, y = 0, z = 0;
    switch (n.type) {
      case 'FRAUD_ORIGIN':
        x = -17; y = 0; z = 0;
        break;
      case 'GAS_SPONSOR':
        x = -17; y = 5.0 * (idx % 2 === 0 ? 1 : -1) * Math.ceil((idx + 1) / 2); z = -2.5;
        break;
      case 'PEEL_CHAIN':
        x = -6; y = 4.4 - idx * 4.0; z = (idx % 2 === 0 ? 2 : -2);
        break;
      case 'INTERMEDIATE':
        x = idx % 2 === 0 ? -6 : 5; y = -4.4; z = 1.8;
        break;
      case 'MIXER':
        x = 5; y = (idx === 0 ? 5.4 : -1.2); z = 2.0;
        break;
      case 'EXCHANGE_EXIT':
        x = 16; y = 3.4 * (idx === 0 ? 1 : -1); z = 1.2;
        break;
      default:
        x = 0; y = idx * 3; z = 0;
    }
    map.set(n.id, new THREE.Vector3(x, y, z));
  });
  return map;
}

interface Scene3DProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  selectedNode: GraphNodeData | null;
  onSelectNode: (node: GraphNodeData) => void;
  hoveredNodeId: string | null;
  onHoverNode: (nodeId: string | null) => void;
  hiddenNodeTypes: Set<NodeType>;
  timelineBlock: number;
  focusedNodeIds: string[] | null;
  dimensionMode: '3D' | '2D';
  currentHop: number; // 0 to 4
  playbackSpeed: 0.5 | 1 | 2;
  resetViewTrigger: number;
}

// Helper to calculate the centroid of the newly revealed node cluster for each hop
function getHopClusterCenter(hop: number, positions: Map<string, THREE.Vector3>, nodes: GraphNodeData[]): THREE.Vector3 {
  if (hop === 4) {
    // Overview mode: center on the midpoint of the entire forensic pipeline
    return new THREE.Vector3(0, 0, 0);
  }

  const center = new THREE.Vector3();
  let count = 0;
  nodes.forEach((n) => {
    const h = getNodeHop(n.id, n.type);
    if (hop === 0 ? (h === 0 || h === -1) : (h === hop)) {
      const p = positions.get(n.id);
      if (p) {
        center.add(p);
        count++;
      }
    }
  });

  if (count > 0) {
    center.divideScalar(count);
  } else {
    center.set(hop === 0 ? -16 : hop === 1 ? -6 : hop === 2 ? 4 : 16, 0, 0);
  }
  return center;
}

// Compute required camera distance to guarantee all revealed nodes fit comfortably within viewport margins
function calculateRequiredCameraDistance(
  targetLookAt: THREE.Vector3,
  viewDirection: THREE.Vector3,
  revealedHop: number,
  positions: Map<string, THREE.Vector3>,
  camera: THREE.PerspectiveCamera,
  dimensionMode: '3D' | '2D',
  nodes: GraphNodeData[]
): number {
  if (!viewDirection || !isFinite(viewDirection.x) || !isFinite(viewDirection.y) || !isFinite(viewDirection.z)) {
    return revealedHop === 0 ? 18 : 45;
  }

  const fov = camera?.fov && isFinite(camera.fov) ? camera.fov : 48;
  const fovRad = (fov * Math.PI) / 180;
  const aspect = camera?.aspect && isFinite(camera.aspect) && camera.aspect > 0.1 ? camera.aspect : 1.6;
  const vFovHalf = fovRad / 2;
  const hFovHalf = Math.atan(Math.tan(vFovHalf) * aspect);

  const tanH = Math.max(0.1, Math.tan(hFovHalf) * 0.70);
  const tanV = Math.max(0.1, Math.tan(vFovHalf) * 0.74);

  const forward = viewDirection.clone().negate();
  let up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(forward.dot(up)) > 0.92) {
    up.set(0, 0, dimensionMode === '2D' ? 1 : -1);
  }
  const right = new THREE.Vector3().crossVectors(forward, up);
  if (right.lengthSq() < 0.001 || !isFinite(right.x)) {
    right.set(1, 0, 0);
  } else {
    right.normalize();
  }
  const camUp = new THREE.Vector3().crossVectors(right, forward);
  if (camUp.lengthSq() < 0.001 || !isFinite(camUp.x)) {
    camUp.set(0, 1, 0);
  } else {
    camUp.normalize();
  }

  let maxRequiredDist = revealedHop === 0 ? 14 : 22;

  nodes.forEach((n) => {
    const nodeHop = getNodeHop(n.id, n.type);
    const pos = positions.get(n.id);
    if (pos && nodeHop <= revealedHop) {
      const rel = pos.clone().sub(targetLookAt);
      const latX = Math.abs(rel.dot(right)) + 2.0;
      const latY = Math.abs(rel.dot(camUp)) + 2.0;
      const alongForward = rel.dot(forward);

      const distNeededX = latX / tanH - alongForward;
      const distNeededY = latY / tanV - alongForward;

      if (isFinite(distNeededX) && distNeededX > maxRequiredDist) maxRequiredDist = distNeededX;
      if (isFinite(distNeededY) && distNeededY > maxRequiredDist) maxRequiredDist = distNeededY;
    }
  });

  const minBound = revealedHop === 0 ? 12 : 18;
  const maxBound = 110;
  if (!isFinite(maxRequiredDist)) {
    return revealedHop === 0 ? 18 : 50;
  }
  return THREE.MathUtils.clamp(maxRequiredDist, minBound, maxBound);
}

export const GraphVisualizer: React.FC<Scene3DProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  hiddenNodeTypes,
  timelineBlock,
  focusedNodeIds,
  dimensionMode,
  currentHop,
  playbackSpeed,
  resetViewTrigger,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Dynamic 3D positions (uses custom procedural node positions when provided, otherwise fallback)
  const currentPositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    const basePositions = computeBasePositions(nodes);
    nodes.forEach((n) => {
      if (n.position && n.position.length === 3) {
        const z = dimensionMode === '2D' ? 0 : n.position[2];
        map.set(n.id, new THREE.Vector3(n.position[0], n.position[1], z));
      } else {
        const p = basePositions.get(n.id) || new THREE.Vector3();
        const z = dimensionMode === '2D' ? 0 : p.z;
        map.set(n.id, new THREE.Vector3(p.x, p.y, z));
      }
    });
    return map;
  }, [nodes, dimensionMode]);

  // Target camera position & lookAt
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const lastInteractionTime = useRef<number>(Date.now());
  const isUserInteractingRef = useRef<boolean>(false);

  // Nodes flash state (when tracer hits target node)
  const [nodeFlashMap, setNodeFlashMap] = useState<Record<string, number>>({});

  // Auto-fit camera distance on mount
  useEffect(() => {
    const box = new THREE.Box3();
    currentPositions.forEach((p: THREE.Vector3) => box.expandByPoint(p));
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const fitDist = Math.max(48, sphere.radius * 2.3);

    if (dimensionMode === '3D') {
      camera.position.set(0, 14, fitDist);
    } else {
      camera.position.set(0, 0, fitDist);
    }
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  // Handle Dimension Mode change (2D <-> 3D)
  useEffect(() => {
    if (dimensionMode === '2D') {
      targetCamPos.current = new THREE.Vector3(0, 0, 52);
      targetLookAt.current = new THREE.Vector3(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
        controlsRef.current.enableRotate = false;
      }
    } else {
      const clusterCenter = getHopClusterCenter(currentHop, currentPositions, nodes);
      const orbitDir = new THREE.Vector3(0, 0.28, 1).normalize();
      const reqDist = calculateRequiredCameraDistance(
        clusterCenter,
        orbitDir,
        currentHop,
        currentPositions,
        camera as THREE.PerspectiveCamera,
        '3D',
        nodes
      );
      targetCamPos.current = clusterCenter.clone().add(orbitDir.multiplyScalar(reqDist));
      targetLookAt.current = clusterCenter;

      if (controlsRef.current) {
        controlsRef.current.enableRotate = true;
        controlsRef.current.autoRotate = false;
      }
    }
    lastInteractionTime.current = Date.now();
  }, [dimensionMode, currentHop, currentPositions, camera, nodes]);

  // Handle Reset View Trigger
  useEffect(() => {
    if (resetViewTrigger > 0) {
      const overviewCenter = new THREE.Vector3(0, 0, 0);
      const orbitDir = dimensionMode === '3D'
        ? new THREE.Vector3(0, 0.28, 1).normalize()
        : new THREE.Vector3(0, 0, 1);
      const reqDist = calculateRequiredCameraDistance(
        overviewCenter,
        orbitDir,
        4,
        currentPositions,
        camera as THREE.PerspectiveCamera,
        dimensionMode,
        nodes
      );
      targetLookAt.current = overviewCenter;
      targetCamPos.current = dimensionMode === '3D'
        ? overviewCenter.clone().add(orbitDir.multiplyScalar(reqDist))
        : new THREE.Vector3(0, 0, reqDist);
      lastInteractionTime.current = Date.now();
    }
  }, [resetViewTrigger, dimensionMode, currentPositions, camera]);

  // Handle node selection camera flight
  useEffect(() => {
    if (selectedNode) {
      const pos = currentPositions.get(selectedNode.id);
      if (pos) {
        if (dimensionMode === '3D') {
          let currentOffset = controlsRef.current
            ? camera.position.clone().sub(controlsRef.current.target)
            : new THREE.Vector3(0, 0.35, 1);
          if (currentOffset.lengthSq() < 0.001 || !isFinite(currentOffset.x) || !isFinite(currentOffset.y) || !isFinite(currentOffset.z)) {
            currentOffset = new THREE.Vector3(0, 0.35, 1);
          }
          currentOffset.normalize();
          targetCamPos.current = pos.clone().add(currentOffset.multiplyScalar(10));
        } else {
          targetCamPos.current = new THREE.Vector3(pos.x, pos.y, 28);
        }
        targetLookAt.current = pos.clone();
        if (controlsRef.current) controlsRef.current.autoRotate = false;
        lastInteractionTime.current = Date.now();
      }
    }
  }, [selectedNode, currentPositions, dimensionMode, camera]);

  // Handle finding focus
  useEffect(() => {
    if (focusedNodeIds && focusedNodeIds.length > 0) {
      const firstId = focusedNodeIds[0];
      const pos = currentPositions.get(firstId);
      if (pos) {
        targetCamPos.current = dimensionMode === '3D'
          ? pos.clone().add(new THREE.Vector3(0, 3, 11))
          : new THREE.Vector3(pos.x, pos.y, 30);
        targetLookAt.current = pos.clone();
        if (controlsRef.current) controlsRef.current.autoRotate = false;
        lastInteractionTime.current = Date.now();
      }
    }
  }, [focusedNodeIds, currentPositions, dimensionMode]);

  // Hopping Camera Transition
  useEffect(() => {
    if (selectedNode) return;
    if (isUserInteractingRef.current) return;

    const clusterCenter = getHopClusterCenter(currentHop, currentPositions, nodes);
    const currentOffset = controlsRef.current
      ? camera.position.clone().sub(controlsRef.current.target)
      : new THREE.Vector3(0, 14, 54);

    let orbitDir = currentOffset.clone();
    if (orbitDir.lengthSq() < 0.001 || !isFinite(orbitDir.x) || !isFinite(orbitDir.y) || !isFinite(orbitDir.z)) {
      orbitDir = dimensionMode === '3D'
        ? new THREE.Vector3(0, 0.28, 1)
        : new THREE.Vector3(0, 0, 1);
    }
    if (dimensionMode === '2D') {
      orbitDir.set(0, 0, 1);
    }
    orbitDir.normalize();

    const requiredDistance = calculateRequiredCameraDistance(
      clusterCenter,
      orbitDir,
      currentHop,
      currentPositions,
      camera as THREE.PerspectiveCamera,
      dimensionMode,
      nodes
    );

    targetLookAt.current = clusterCenter;
    targetCamPos.current = dimensionMode === '3D'
      ? clusterCenter.clone().add(orbitDir.clone().multiplyScalar(requiredDistance))
      : new THREE.Vector3(clusterCenter.x, clusterCenter.y, requiredDistance);

    lastInteractionTime.current = Date.now();
  }, [currentHop, selectedNode, dimensionMode, currentPositions, camera, nodes]);

  // Trigger flash on target node
  const handleTracerArrival = (targetNodeId: string) => {
    setNodeFlashMap(prev => ({ ...prev, [targetNodeId]: Date.now() }));
  };

  // Main Render Loop: Smooth Camera Flight without Frame-by-Frame Stutter
  useFrame(() => {
    // Self-healing: if camera position ever becomes NaN or non-finite, reset to safe overview
    if (!isFinite(camera.position.x) || !isFinite(camera.position.y) || !isFinite(camera.position.z)) {
      camera.position.set(0, 14, 55);
    }
    if (controlsRef.current && (!isFinite(controlsRef.current.target.x) || !isFinite(controlsRef.current.target.y) || !isFinite(controlsRef.current.target.z))) {
      controlsRef.current.target.set(0, 0, 0);
    }

    if (
      targetCamPos.current &&
      isFinite(targetCamPos.current.x) &&
      isFinite(targetCamPos.current.y) &&
      isFinite(targetCamPos.current.z) &&
      targetLookAt.current &&
      isFinite(targetLookAt.current.x) &&
      isFinite(targetLookAt.current.y) &&
      isFinite(targetLookAt.current.z) &&
      controlsRef.current &&
      !isUserInteractingRef.current
    ) {
      camera.position.lerp(targetCamPos.current, 0.065);
      controlsRef.current.target.lerp(targetLookAt.current, 0.065);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(targetCamPos.current) < 0.15 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.15
      ) {
        targetCamPos.current = null;
        targetLookAt.current = null;
      }
    }

    if (controlsRef.current && dimensionMode === '3D') {
      if (!targetCamPos.current && !isUserInteractingRef.current && currentHop === 4 && Date.now() - lastInteractionTime.current > 6000) {
        controlsRef.current.autoRotate = true;
      }
    }
  });

  // Filter edges based on hopIndex & timeline
  const visibleEdges = useMemo(() => {
    return edges.filter(e => {
      // In full overview mode (hop 4), guarantee all edges are visible
      if (currentHop === 4) return true;
      // If at Hop 0, show hop 0 and hop 1 so the primary transaction is visible immediately
      if (currentHop === 0) return e.hopIndex <= 1;
      return e.hopIndex <= currentHop;
    });
  }, [edges, currentHop]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        autoRotate={false}
        autoRotateSpeed={0.3}
        minDistance={8}
        maxDistance={120}
        enableRotate={dimensionMode === '3D'}
        enablePan={true}
        enableZoom={true}
        onStart={() => {
          isUserInteractingRef.current = true;
          lastInteractionTime.current = Date.now();
          targetCamPos.current = null;
          targetLookAt.current = null;
          if (controlsRef.current) controlsRef.current.autoRotate = false;
        }}
        onEnd={() => {
          isUserInteractingRef.current = false;
          lastInteractionTime.current = Date.now();
        }}
      />

      {/* Hop 0: Gas Origin Pulse Ring expanding from Fraud Origin */}
      {currentHop === 0 && (
        <GasPulseRing originPosition={currentPositions.get('fraud-origin') || (nodes[0] ? currentPositions.get(nodes[0].id) : undefined) || new THREE.Vector3(-24, 0, 0)} />
      )}

      {/* Render High-Visibility Edge Tubes with Conduit Glow, Tracers & Flow Particles */}
      {visibleEdges.map((edge, index) => {
        const p1 = currentPositions.get(edge.source);
        const p2 = currentPositions.get(edge.target);
        if (!p1 || !p2) return null;

        const srcNode = nodes.find(n => n.id === edge.source);
        const isDimmed = (srcNode && hiddenNodeTypes.has(srcNode.type)) || 
          (focusedNodeIds && !focusedNodeIds.includes(edge.source) && !focusedNodeIds.includes(edge.target));

        const isCurrentHopEdge = edge.hopIndex === currentHop;
        const isPastHopEdge = edge.hopIndex < currentHop || currentHop === 4;

        const handleEdgeClick = () => {
          // If current selected node is source, hop to target; if target, hop to source; otherwise hop to target
          const nextNodeId = selectedNode?.id === edge.source 
            ? edge.target 
            : (selectedNode?.id === edge.target ? edge.source : edge.target);
          const nextNode = nodes.find(n => n.id === nextNodeId);
          if (nextNode) {
            onSelectNode(nextNode);
          }
        };

        return (
          <EdgeTube
            key={edge.id}
            edge={edge}
            edgeIndex={index}
            start={p1}
            end={p2}
            sourceColor={srcNode ? ((NODE_CONFIG as any)[srcNode.type]?.color || '#00f2fe') : '#00f2fe'}
            glowColor={srcNode ? ((NODE_CONFIG as any)[srcNode.type]?.glowColor || '#00f2fe') : '#00f2fe'}
            isDimmed={Boolean(isDimmed)}
            dimensionMode={dimensionMode}
            isCurrentHopEdge={isCurrentHopEdge}
            isPastHopEdge={isPastHopEdge}
            playbackSpeed={playbackSpeed}
            onTracerArrive={() => handleTracerArrival(edge.target)}
            onClick={handleEdgeClick}
          />
        );
      })}

      {/* Render High-Contrast Cyber Forensic Nodes */}
      {nodes.map((node) => {
        const pos = currentPositions.get(node.id) || new THREE.Vector3();
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isHidden = hiddenNodeTypes.has(node.type);
        const isFocused = focusedNodeIds ? focusedNodeIds.includes(node.id) : false;

        const nodeHop = getNodeHop(node.id, node.type);
        const isRevealed = nodeHop <= currentHop;
        const isJustAppeared = nodeHop === currentHop;

        const flashTime = nodeFlashMap[node.id] || 0;
        const isFlashing = Date.now() - flashTime < 350;

        return (
          <CyberForensicNode
            key={node.id}
            node={node}
            position={pos}
            isSelected={isSelected}
            isHovered={isHovered}
            isHidden={isHidden}
            isFocused={isFocused}
            isRevealed={isRevealed}
            isJustAppeared={isJustAppeared}
            isFlashing={isFlashing}
            dimensionMode={dimensionMode}
            playbackSpeed={playbackSpeed}
            onClick={() => onSelectNode(node)}
            onPointerOver={() => onHoverNode(node.id)}
            onPointerOut={() => onHoverNode(null)}
          />
        );
      })}
    </>
  );
};

// Gas Origin Pulse Ring expanding outward from Fraud Origin at Hop 0
const GasPulseRing: React.FC<{ originPosition: THREE.Vector3 }> = ({ originPosition }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number>(Date.now());

  useFrame(() => {
    if (!ringRef.current) return;
    const elapsed = (Date.now() - startTime.current) % 1200;
    const progress = elapsed / 1200;
    const scale = progress * 3.8;
    const opacity = Math.max(0, 1 - progress);
    ringRef.current.scale.set(scale, scale, 1);
    if ((ringRef.current.material as THREE.MeshBasicMaterial).opacity !== undefined) {
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.9;
    }
  });

  return (
    <mesh ref={ringRef} position={[originPosition.x, originPosition.y, originPosition.z + 0.05]}>
      <ringGeometry args={[0.25, 0.5, 32]} />
      <meshBasicMaterial color="#00f2fe" transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
};

// High-Visibility 3D Edge Tube Conduit with Emissive Glow & Flowing Currency Particles
const EdgeTube: React.FC<{
  edge: GraphEdgeData;
  edgeIndex: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  sourceColor: string;
  glowColor: string;
  isDimmed: boolean;
  dimensionMode: '3D' | '2D';
  isCurrentHopEdge: boolean;
  isPastHopEdge: boolean;
  playbackSpeed: 0.5 | 1 | 2;
  onTracerArrive: () => void;
  onClick?: () => void;
}> = ({
  edge,
  edgeIndex,
  start,
  end,
  sourceColor,
  glowColor,
  isDimmed,
  dimensionMode,
  isCurrentHopEdge,
  isPastHopEdge,
  playbackSpeed,
  onTracerArrive,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(isPastHopEdge || isCurrentHopEdge);
  const drawStartTime = useRef<number>(0);
  const hasTriggeredArrival = useRef<boolean>(false);
  const progressRef = useRef<number>(isPastHopEdge ? 1 : 0);

  useEffect(() => {
    if (isCurrentHopEdge) {
      hasTriggeredArrival.current = false;
      progressRef.current = 0;
      setIsVisible(true);
      const staggerDelay = (edgeIndex % 3) * (180 / playbackSpeed);
      const timer = setTimeout(() => {
        drawStartTime.current = Date.now();
      }, staggerDelay);
      return () => clearTimeout(timer);
    } else if (isPastHopEdge) {
      progressRef.current = 1;
      setIsVisible(true);
    } else {
      progressRef.current = 0;
      setIsVisible(false);
    }
  }, [isCurrentHopEdge, isPastHopEdge, edgeIndex, playbackSpeed]);

  // Clean, sweeping S-curve trajectory with solid thickness
  const { curve, fullTubeGeometry } = useMemo(() => {
    const dist = start.distanceTo(end);
    const mid1 = new THREE.Vector3(
      start.x + (end.x - start.x) * 0.4,
      start.y,
      start.z
    );
    const mid2 = new THREE.Vector3(
      start.x + (end.x - start.x) * 0.6,
      end.y,
      end.z
    );

    if (dimensionMode === '3D') {
      const arcZ = Math.min(1.8, dist * 0.08);
      mid1.z += arcZ;
      mid2.z -= arcZ * 0.5;
    } else {
      mid1.z = 0;
      mid2.z = 0;
    }

    const c = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
    const geom = new THREE.TubeGeometry(c, 36, 0.038, 12, false);
    return { curve: c, fullTubeGeometry: geom };
  }, [start, end, dimensionMode]);

  const particleCount = useMemo(() => {
    return Math.min(7, Math.max(3, Math.round(edge.taintAmount / 14) + 3));
  }, [edge.taintAmount]);

  const particleOffsets = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => i / particleCount);
  }, [particleCount]);

  const tubeMeshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const tracerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const now = Date.now();

    if (isCurrentHopEdge && drawStartTime.current > 0 && progressRef.current < 1) {
      const elapsed = now - drawStartTime.current;
      const duration = 750 / playbackSpeed;
      const nextProgress = Math.min(1, elapsed / duration);
      progressRef.current = nextProgress;

      if (tracerRef.current) {
        if (nextProgress < 1) {
          tracerRef.current.visible = true;
          const pt = curve.getPointAt(nextProgress);
          tracerRef.current.position.copy(pt);
        } else {
          tracerRef.current.visible = false;
        }
      }

      if (nextProgress >= 1 && !hasTriggeredArrival.current) {
        hasTriggeredArrival.current = true;
        onTracerArrive();
      }
    } else if (tracerRef.current && progressRef.current >= 1) {
      tracerRef.current.visible = false;
    }

    if (isPastHopEdge && particlesRef.current) {
      const speed = (0.22 + (edge.taintAmount / 100) * 0.28) * playbackSpeed;
      const time = performance.now() * 0.001 * speed;

      particlesRef.current.children.forEach((child, i) => {
        const offset = particleOffsets[i];
        const t = (time + offset) % 1;
        const pt = curve.getPointAt(t);
        child.position.copy(pt);
      });
    }
  });

  if (!isVisible) return null;

  return (
    <group>
      {/* High-Visibility Luminescent Conduit Tube */}
      <mesh
        geometry={fullTubeGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={sourceColor}
          emissive={glowColor}
          emissiveIntensity={hovered ? 0.9 : 0.45}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={isDimmed ? 0.08 : hovered ? 0.95 : 0.72}
        />
      </mesh>

      {/* Hopping Tracer Particle (Radiant Core) */}
      <mesh ref={tracerRef} visible={false}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Ambient Moving Funds Particles */}
      {isPastHopEdge && !isDimmed && (
        <group ref={particlesRef}>
          {particleOffsets.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={glowColor}
                emissiveIntensity={1.1}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* On-Hover Tooltip */}
      {hovered && (
        <Html position={curve.getPointAt(0.5)} center distanceFactor={18} zIndexRange={[100, 0]}>
          <div className="pointer-events-none rounded-lg bg-slate-950/95 backdrop-blur-md border border-cyan-400/50 px-3 py-1.5 text-[11px] font-mono text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)] whitespace-nowrap">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{edge.taintAmount} ETH</span>
            </div>
            <div className="text-[9.5px] text-slate-400">
              Evidence: <span className="text-cyan-400">{edge.evidenceId}</span> · Hop {edge.hopIndex}
            </div>
            <div className="text-[9px] text-cyan-400 mt-1 font-semibold flex items-center gap-1 border-t border-white/10 pt-1">
              <span>➔ Click edge to hop to connected wallet</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// =========================================================================
// HIGH-CONTRAST CYBER FORENSIC NODE
// Clearly visible silhouettes with vibrant colors, metallic trims, and luminous cores
// =========================================================================
const CyberForensicNode: React.FC<{
  node: GraphNodeData;
  position: THREE.Vector3;
  isSelected: boolean;
  isHovered: boolean;
  isHidden: boolean;
  isFocused: boolean;
  isRevealed: boolean;
  isJustAppeared: boolean;
  isFlashing: boolean;
  dimensionMode: '3D' | '2D';
  playbackSpeed: 0.5 | 1 | 2;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}> = ({
  node,
  position,
  isSelected,
  isHovered,
  isHidden,
  isFocused,
  isRevealed,
  isJustAppeared,
  isFlashing,
  dimensionMode,
  playbackSpeed,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const meshGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const nodeType = (node.type || 'INTERMEDIATE').toUpperCase() as keyof typeof NODE_CONFIG;
  const cfg = NODE_CONFIG[nodeType] || NODE_CONFIG['INTERMEDIATE'] || {
    color: '#38bdf8',
    glowColor: '#0284c7',
    label: 'Target Node',
    radius: 0.6,
  };

  // Active exchange/culprit hub nodes that exhibit the heartbeat pulse
  const hasHeartbeat = node.type === 'FRAUD_ORIGIN' || node.type === 'MIXER' || node.type === 'EXCHANGE_EXIT';

  // Staggered heartbeat phase offset so nodes pulse in a cascading natural rhythm
  const phaseOffset = useMemo(() => {
    if (node.type === 'FRAUD_ORIGIN') return 0;
    if (node.type === 'MIXER') return node.id === 'mixer-1' ? 0.45 : 0.9;
    if (node.type === 'EXCHANGE_EXIT') return node.id === 'exit-1' ? 1.35 : 1.75;
    return 0;
  }, [node.type, node.id]);

  // Spring physics state for heartbeat oscillation
  const springScaleRef = useRef<number>(1.0);
  const springVelRef = useRef<number>(0);
  const lastHeartbeatTimeRef = useRef<number>(performance.now() * 0.001 - phaseOffset);
  const secondBeatPendingRef = useRef<boolean>(false);
  const secondBeatTimeRef = useRef<number>(0);

  const [scaleFactor, setScaleFactor] = useState<number>(isRevealed ? 1 : 0);

  useEffect(() => {
    setScaleFactor(isRevealed ? 1 : 0);
  }, [isRevealed]);

  const hoverScaleMultiplier = isHovered ? 1.35 : isSelected ? 1.25 : isFocused ? 1.18 : 1;
  const targetScale = scaleFactor * hoverScaleMultiplier;
  const targetOpacity = isHidden ? 0.08 : 1;

  useFrame((_, delta) => {
    if (!meshGroupRef.current) return;
    const currentScale = meshGroupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 8 * playbackSpeed);

    // Spring-based heartbeat scale oscillation
    if (hasHeartbeat && isRevealed) {
      const now = performance.now() * 0.001;
      const cyclePeriod = 2.4; // 2.4s calm periodic heartbeat cycle

      // Trigger primary systolic kick (lub)
      if (now - lastHeartbeatTimeRef.current >= cyclePeriod) {
        lastHeartbeatTimeRef.current = now;
        springVelRef.current += 1.35;
        secondBeatPendingRef.current = true;
        secondBeatTimeRef.current = now + 0.22; // diastolic follow-up 220ms later
      }

      // Trigger secondary diastolic rebound (dub)
      if (secondBeatPendingRef.current && now >= secondBeatTimeRef.current) {
        springVelRef.current += 0.75;
        secondBeatPendingRef.current = false;
      }

      // Damped harmonic spring physics integration
      const dt = Math.min(delta, 0.04);
      const stiffness = 150;
      const damping = 13;
      const displacement = springScaleRef.current - 1.0;
      const springForce = -stiffness * displacement - damping * springVelRef.current;

      springVelRef.current += springForce * dt;
      springScaleRef.current += springVelRef.current * dt;
      springScaleRef.current = Math.max(0.85, Math.min(1.35, springScaleRef.current));
    } else {
      springScaleRef.current = 1.0;
      springVelRef.current = 0;
    }

    const heartbeatMultiplier = hasHeartbeat ? springScaleRef.current : 1.0;
    meshGroupRef.current.scale.setScalar(nextScale * heartbeatMultiplier);

    if (dimensionMode === '3D') {
      if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.45;
      if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.65;
      if (coreRef.current && (node.type === 'MIXER' || node.type === 'EXCHANGE_EXIT')) {
        coreRef.current.rotation.y += delta * 0.5;
      }
    } else {
      if (meshGroupRef.current) meshGroupRef.current.rotation.set(0, 0, 0);
    }
  });

  const safeAddress = node.address || '0x0000000000000000';
  const truncatedAddress = safeAddress.length > 10 ? `${safeAddress.slice(0, 6)}...${safeAddress.slice(-4)}` : safeAddress;
  const baseEmissive = node.type === 'FRAUD_ORIGIN' ? 0.65 : 0.45;
  const heartbeatEmissiveBoost = hasHeartbeat ? Math.max(0, (springScaleRef.current - 1.0) * 0.65) : 0;
  const emissiveIntensity = (isFlashing ? 1.4 : isHovered ? baseEmissive + 0.35 : baseEmissive) + heartbeatEmissiveBoost;

  if (!isRevealed && targetScale < 0.01) return null;

  return (
    <group position={position}>
      <group
        ref={meshGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onPointerOver();
          }}
          onPointerOut={() => onPointerOut()}
        >
          {/* ============================================================== */}
          {/* 1. FRAUD / VICTIM ORIGIN: High-Visibility Cyber Siphon Core    */}
          {/* ============================================================== */}
          {node.type === 'FRAUD_ORIGIN' && (
            <group>
              {/* Central Radiant Sphere */}
              <mesh ref={coreRef}>
                <sphereGeometry args={[1.3, 32, 32]} />
                <meshStandardMaterial
                  color="#ff2a5f"
                  emissive="#ff0033"
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.5}
                  metalness={0.3}
                  transparent
                  opacity={targetOpacity}
                />
              </mesh>

              {/* Titanium Terminal Caps */}
              <mesh position={[0, 1.32, 0]}>
                <cylinderGeometry args={[0.75, 0.75, 0.18, 24]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
              </mesh>
              <mesh position={[0, -1.32, 0]}>
                <cylinderGeometry args={[0.75, 0.75, 0.18, 24]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
              </mesh>

              {/* Radiant Telemetry Rings */}
              {dimensionMode === '3D' && (
                <>
                  <mesh ref={ring1Ref}>
                    <ringGeometry args={[1.65, 1.78, 32]} />
                    <meshBasicMaterial color="#ff2a5f" side={THREE.DoubleSide} transparent opacity={0.85} />
                  </mesh>
                  <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
                    <ringGeometry args={[1.95, 2.05, 32]} />
                    <meshBasicMaterial color="#00f2fe" side={THREE.DoubleSide} transparent opacity={0.75} />
                  </mesh>
                </>
              )}
            </group>
          )}

          {/* ============================================================== */}
          {/* 2. PEEL CHAIN: Luminous Gold Cryptographic Token Wafer        */}
          {/* ============================================================== */}
          {node.type === 'PEEL_CHAIN' && (
            <group rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[cfg.radius, cfg.radius, 0.32, 32]} />
                <meshStandardMaterial
                  color="#f59e0b"
                  emissive="#fbbf24"
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.4}
                  metalness={0.5}
                  transparent
                  opacity={targetOpacity}
                />
              </mesh>
              <mesh position={[0, 0.165, 0]}>
                <cylinderGeometry args={[cfg.radius * 0.88, cfg.radius * 0.88, 0.05, 32]} />
                <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.165, 0]}>
                <cylinderGeometry args={[cfg.radius * 0.88, cfg.radius * 0.88, 0.05, 32]} />
                <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )}

          {/* ============================================================== */}
          {/* 3. MIXER: High-Tech Electric Amethyst Stealth Chamber          */}
          {/* ============================================================== */}
          {node.type === 'MIXER' && (
            <group>
              <mesh>
                <boxGeometry args={[1.05, 1.05, 1.05]} />
                <meshStandardMaterial
                  color="#3b0764"
                  emissive="#d946ef"
                  emissiveIntensity={emissiveIntensity * 0.7}
                  roughness={0.5}
                  metalness={0.4}
                  transparent
                  opacity={targetOpacity * 0.95}
                />
              </mesh>
              <mesh ref={coreRef}>
                <sphereGeometry args={[0.48, 24, 24]} />
                <meshStandardMaterial
                  color="#f0abfc"
                  emissive="#e879f9"
                  emissiveIntensity={emissiveIntensity * 1.3}
                  roughness={0.3}
                  metalness={0.6}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.85, 0.04, 16, 32]} />
                <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )}

          {/* ============================================================== */}
          {/* 4. EXCHANGE EXIT: Regulated Cyan Custodial Server Monolith     */}
          {/* ============================================================== */}
          {node.type === 'EXCHANGE_EXIT' && (
            <group>
              <mesh ref={coreRef}>
                <cylinderGeometry args={[cfg.radius * 0.95, cfg.radius * 0.95, 1.35, 6]} />
                <meshStandardMaterial
                  color="#083344"
                  emissive="#00f2fe"
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.45}
                  metalness={0.4}
                  transparent
                  opacity={targetOpacity}
                />
              </mesh>
              <mesh position={[0, 0.38, 0]}>
                <cylinderGeometry args={[cfg.radius * 1.0, cfg.radius * 1.0, 0.09, 6]} />
                <meshStandardMaterial color="#22d3ee" emissive="#00f2fe" emissiveIntensity={0.9} />
              </mesh>
              <mesh position={[0, -0.38, 0]}>
                <cylinderGeometry args={[cfg.radius * 1.0, cfg.radius * 1.0, 0.09, 6]} />
                <meshStandardMaterial color="#22d3ee" emissive="#00f2fe" emissiveIntensity={0.9} />
              </mesh>
            </group>
          )}

          {/* ============================================================== */}
          {/* 5. GAS SPONSOR: Vivid Emerald Power Cell / Funder Module       */}
          {/* ============================================================== */}
          {node.type === 'GAS_SPONSOR' && (
            <group rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[cfg.radius, cfg.radius, 0.3, 6]} />
                <meshStandardMaterial
                  color="#166534"
                  emissive="#4ade80"
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.5}
                  metalness={0.3}
                  transparent
                  opacity={targetOpacity}
                />
              </mesh>
              <mesh position={[0, 0.155, 0]}>
                <cylinderGeometry args={[cfg.radius * 0.7, cfg.radius * 0.7, 0.05, 6]} />
                <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={0.8} />
              </mesh>
            </group>
          )}

          {/* ============================================================== */}
          {/* 6. INTERMEDIATE: Vivid Sky-Blue Relay Puck                     */}
          {/* ============================================================== */}
          {node.type === 'INTERMEDIATE' && (
            <group rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[cfg.radius, cfg.radius, 0.24, 24]} />
                <meshStandardMaterial
                  color="#075985"
                  emissive="#38bdf8"
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.5}
                  metalness={0.35}
                  transparent
                  opacity={targetOpacity}
                />
              </mesh>
              <mesh position={[0, 0.125, 0]}>
                <cylinderGeometry args={[cfg.radius * 0.65, cfg.radius * 0.65, 0.04, 24]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.7} metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )}

          {/* Selected Halo Ring */}
          {isSelected && (
            <mesh>
              <ringGeometry args={[cfg.radius * 1.35, cfg.radius * 1.52, 32]} />
              <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.95} />
            </mesh>
          )}

          {/* Hop Highlight Ring */}
          {isJustAppeared && !isSelected && (
            <mesh>
              <ringGeometry args={[cfg.radius * 1.32, cfg.radius * 1.45, 32]} />
              <meshBasicMaterial color={cfg.color} side={THREE.DoubleSide} transparent opacity={0.85} />
            </mesh>
          )}
        </group>

        {/* High-contrast badges with crisp readable typography */}
        {(isHovered || isSelected || node.type === 'FRAUD_ORIGIN' || node.type === 'EXCHANGE_EXIT' || node.type === 'MIXER') && !isHidden && (
          <Html position={[0, cfg.radius + 0.75, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
            <div 
              className={`pointer-events-none rounded-lg backdrop-blur-md px-3 py-1.5 text-center font-mono shadow-[0_4px_24px_rgba(0,0,0,0.8)] border transition-all ${
                node.type === 'FRAUD_ORIGIN'
                  ? 'bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/40'
                  : node.type === 'EXCHANGE_EXIT'
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/30'
                  : node.type === 'MIXER'
                  ? 'bg-purple-950/90 border-fuchsia-400 text-fuchsia-200 ring-1 ring-fuchsia-400/30'
                  : isSelected
                  ? 'bg-slate-900/95 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40'
                  : 'bg-slate-950/90 border-white/30 text-white'
              }`}
            >
              <div className="text-[10.5px] font-bold tracking-tight whitespace-nowrap">
                {node.label}
              </div>
              <div className="text-[9px] text-cyan-300 font-mono tracking-wider">
                {truncatedAddress} · {node.balance}
              </div>
            </div>
          </Html>
        )}
    </group>
  );
};
