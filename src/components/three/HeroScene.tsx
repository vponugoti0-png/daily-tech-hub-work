"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

/** Soft database cylinder stack (not a generic orb). */
function DatabaseStack() {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.18;
  });

  const discs = useMemo(
    () =>
      [0, 1, 2].map((i) => ({
        y: 0.55 - i * 0.55,
        color: i === 0 ? "#FF6B4A" : i === 1 ? "#9B5CFF" : "#4CC9F0",
        opacity: 0.92 - i * 0.08,
      })),
    [],
  );

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.55}>
      <group ref={ref} position={[0.85, -0.15, 0]} scale={1.05}>
        {discs.map((d, i) => (
          <mesh key={i} position={[0, d.y, 0]}>
            <cylinderGeometry args={[0.72, 0.72, 0.38, 32]} />
            <meshStandardMaterial
              color={d.color}
              metalness={0.45}
              roughness={0.28}
              transparent
              opacity={d.opacity}
            />
          </mesh>
        ))}
        {discs.map((d, i) => (
          <mesh key={`rim-${i}`} position={[0, d.y + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.72, 0.03, 8, 40]} />
            <meshStandardMaterial
              color="#FFD166"
              emissive="#FFD166"
              emissiveIntensity={0.35}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

/** Flat table motif beside the cylinder. */
function TableMotif() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
  });
  return (
    <Float speed={0.9} floatIntensity={0.35}>
      <group ref={ref} position={[-1.15, -0.35, 0.2]} rotation={[0.35, 0.55, 0.1]} scale={0.95}>
        <mesh>
          <boxGeometry args={[1.6, 0.08, 1.05]} />
          <meshStandardMaterial color="#2EE59D" metalness={0.35} roughness={0.4} transparent opacity={0.85} />
        </mesh>
        {[-0.35, 0, 0.35].map((z, i) => (
          <mesh key={`row-${i}`} position={[0, 0.05, z]}>
            <boxGeometry args={[1.45, 0.02, 0.03]} />
            <meshStandardMaterial color="#2a2150" transparent opacity={0.45} />
          </mesh>
        ))}
        {[-0.45, 0, 0.45].map((x, i) => (
          <mesh key={`col-${i}`} position={[x, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.9]} />
            <meshStandardMaterial color="#2a2150" transparent opacity={0.45} />
          </mesh>
        ))}
        {(
          [
            [-0.65, -0.35, -0.4],
            [0.65, -0.35, -0.4],
            [-0.65, -0.35, 0.4],
            [0.65, -0.35, 0.4],
          ] as const
        ).map((p, i) => (
          <mesh key={`leg-${i}`} position={p}>
            <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
            <meshStandardMaterial color="#4CC9F0" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function NodeDot({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const s = 0.9 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
    </mesh>
  );
}

/** Neural / node accents with thin connector cylinders (performant, no buffer attrs). */
function NeuralNodes() {
  const group = useRef<Group>(null);
  const colors = ["#FF6B4A", "#4CC9F0", "#2EE59D", "#FFD166", "#9B5CFF"];
  const nodes = useMemo(() => {
    const pts: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const r = 1.85 + (i % 3) * 0.18;
      pts.push({
        pos: [Math.cos(a) * r * 0.55 - 0.1, Math.sin(a * 1.3) * 0.65 + 0.55, Math.sin(a) * r * 0.4],
        color: colors[i % colors.length],
      });
    }
    return pts;
  }, []);

  const links = useMemo(() => {
    const out: { start: [number, number, number]; end: [number, number, number] }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i].pos;
      const b = nodes[(i + 3) % nodes.length].pos;
      out.push({ start: a, end: b });
    }
    return out;
  }, [nodes]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.12;
  });

  return (
    <group ref={group}>
      {links.map((l, i) => {
        const [x1, y1, z1] = l.start;
        const [x2, y2, z2] = l.end;
        const mid: [number, number, number] = [(x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
        const rx = Math.atan2(dz, dy);
        const rz = Math.atan2(dx, Math.sqrt(dy * dy + dz * dz));
        return (
          <mesh key={i} position={mid} rotation={[rx, 0, -rz]}>
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
            <meshBasicMaterial color="#9B5CFF" transparent opacity={0.35} />
          </mesh>
        );
      })}
      {nodes.map((n, i) => (
        <NodeDot key={i} position={n.pos} color={n.color} />
      ))}
    </group>
  );
}

function SoftStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, () => ({
        pos: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4 - 2,
        ] as [number, number, number],
        s: 0.015 + Math.random() * 0.025,
      })),
    [],
  );
  return (
    <group>
      {stars.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.s}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-90" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.35, 5.4], fov: 40 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden
      >
        <ambientLight intensity={0.42} />
        <directionalLight position={[4, 3, 2]} intensity={1.15} color="#4CC9F0" />
        <directionalLight position={[-3, 1, -1]} intensity={0.55} color="#FF6B4A" />
        <pointLight position={[0, 2, 1]} intensity={0.4} color="#9B5CFF" />
        <SoftStars />
        <NeuralNodes />
        <DatabaseStack />
        <TableMotif />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
          <circleGeometry args={[2.4, 48]} />
          <meshBasicMaterial color="#9B5CFF" transparent opacity={0.08} />
        </mesh>
      </Canvas>
    </div>
  );
}
