import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GraphVisualizer } from './Scene3D';
import { GraphNodeData, GraphEdgeData, NodeType } from '../../types/graph3d';

interface ForensicCanvas3DProps {
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
  currentHop: number;
  playbackSpeed: 0.5 | 1 | 2;
  resetViewTrigger: number;
  onDeselect?: () => void;
}

const CHROMATIC_OFFSET = new THREE.Vector2(0.0004, 0.0004);

export const ForensicCanvas3D: React.FC<ForensicCanvas3DProps> = ({
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
  onDeselect,
}) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#020617] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 15, 55], fov: 48 }}
        onPointerMissed={() => onDeselect?.()}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        {/* Layer 0: Scene Fog & Stars */}
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 25, 95]} />

        {/* 3000 tiny white particles, radius 300, depth 100, slow rotation */}
        <Stars
          radius={300}
          depth={100}
          count={3000}
          factor={2.5}
          saturation={0}
          fade
          speed={0.3}
        />

        {/* Requirement 1: Keep ONE ambient light (intensity 0.4) + ONE directional light (intensity 0.6) */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 15]} intensity={0.6} />

        {/* Layer 1: 3D Force-Directed Graph */}
        <Suspense fallback={null}>
          <GraphVisualizer
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
            hoveredNodeId={hoveredNodeId}
            onHoverNode={onHoverNode}
            hiddenNodeTypes={hiddenNodeTypes}
            timelineBlock={timelineBlock}
            focusedNodeIds={focusedNodeIds}
            dimensionMode={dimensionMode}
            currentHop={currentHop}
            playbackSpeed={playbackSpeed}
            resetViewTrigger={resetViewTrigger}
          />
        </Suspense>

        {/* Requirement 1: Lower Bloom intensity 1.8 -> 0.6, raise luminanceThreshold 0.2 -> 0.6 */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            intensity={0.6}
            mipmapBlur
          />
          <ChromaticAberration offset={CHROMATIC_OFFSET} />
          <Noise opacity={0.012} />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
