"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Decorative WebGL layer behind the dashboard hero: a slowly drifting
 * "knowledge graph" of linked nodes around a wireframe core.
 *
 * Readability is the hard constraint. The scene is wireframe-only, sits behind
 * a gradient scrim (see .hero-canvas in globals.css) and never receives pointer
 * events — the DOM copy layered on top is what the user actually reads.
 */

const NODE_COUNT = 22;
const LINK_DISTANCE = 2.9;

type GraphNode = { position: THREE.Vector3; scale: number; speed: number; phase: number };

function buildGraph(): { nodes: GraphNode[]; links: [number, number][] } {
  // Seeded PRNG rather than Math.random: the layout is tuned once instead of
  // being occasionally ugly, and it stays stable across re-mounts.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const nodes: GraphNode[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // Fibonacci sphere → even angular spread, no clumping at the poles.
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.399963; // golden angle
    const jitter = 0.75 + rand() * 0.5;
    nodes.push({
      position: new THREE.Vector3(
        Math.cos(theta) * ring * 3.1 * jitter,
        y * 2.1 * jitter,
        Math.sin(theta) * ring * 3.1 * jitter,
      ),
      scale: 0.1 + rand() * 0.16,
      speed: 0.4 + rand() * 0.7,
      phase: rand() * Math.PI * 2,
    });
  }

  const links: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].position.distanceTo(nodes[j].position) < LINK_DISTANCE) {
        links.push([i, j]);
      }
    }
  }
  return { nodes, links };
}

/** Owns the mouse parallax for the whole scene so its layers stay coherent. */
function ParallaxRig({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const rig = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!animate || !rig.current) return;
    // pointer is normalized to [-1, 1]; lerp so the follow feels weighted.
    rig.current.position.x += (state.pointer.x * 0.35 - rig.current.position.x) * 0.04;
    rig.current.position.y += (state.pointer.y * 0.22 - rig.current.position.y) * 0.04;
  });

  return <group ref={rig}>{children}</group>;
}

function KnowledgeGraph({ color, animate }: { color: THREE.Color; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const { nodes, links } = useMemo(() => buildGraph(), []);

  const linkGeometry = useMemo(() => {
    const points = links.flatMap(([a, b]) => [nodes[a].position, nodes[b].position]);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [links, nodes]);

  const nodeGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);

  // Geometries are created imperatively, so free the GPU buffers explicitly on
  // unmount — this hero mounts and unmounts on every dashboard visit.
  useEffect(
    () => () => {
      linkGeometry.dispose();
      nodeGeometry.dispose();
    },
    [linkGeometry, nodeGeometry],
  );

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.11;
      group.current.rotation.x = Math.sin(t * 0.16) * 0.16;
    }
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const mesh = nodeRefs.current[i];
      if (!mesh) continue;
      const n = nodes[i];
      mesh.scale.setScalar(n.scale * (1 + Math.sin(t * n.speed + n.phase) * 0.22));
      mesh.rotation.x = t * n.speed * 0.5;
      mesh.rotation.y = t * n.speed * 0.35;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={linkGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          geometry={nodeGeometry}
          position={n.position}
          scale={n.scale}
        >
          <meshBasicMaterial color={color} wireframe transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function CoreShell({ color, animate }: { color: THREE.Color; animate: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!animate || !mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = -t * 0.18;
    mesh.current.rotation.z = t * 0.09;
  });

  return (
    <mesh ref={mesh}>
      {/* Low segment counts on purpose: a dense knot reads as noise at this scale. */}
      <torusKnotGeometry args={[0.92, 0.24, 72, 10]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
    </mesh>
  );
}

function Scene({ accent, animate }: { accent: string; animate: boolean }) {
  const color = useMemo(() => new THREE.Color(accent), [accent]);
  return (
    // Offset right so the graph sits behind the stat tiles rather than behind
    // the headline — the copy column stays clean, the scene stays visible.
    <group position={[3.05, 0, 0]} scale={0.95}>
      <ParallaxRig animate={animate}>
        <KnowledgeGraph color={color} animate={animate} />
        <CoreShell color={color} animate={animate} />
      </ParallaxRig>
    </group>
  );
}

export default function HeroScene({
  accent = "#a78bfa",
  animate = true,
}: {
  accent?: string;
  animate?: boolean;
}) {
  return (
    <Canvas
      className="pointer-events-none"
      camera={{ position: [0, 0, 7.2], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      // Reduced motion → render a single static frame instead of a rAF loop.
      frameloop={animate ? "always" : "demand"}
    >
      <Scene accent={accent} animate={animate} />
    </Canvas>
  );
}
