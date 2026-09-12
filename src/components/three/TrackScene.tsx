"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function Crystal({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.4;
      ref.current.rotation.x += dt * 0.15;
    }
  });
  return (
    <Float speed={1.2} floatIntensity={0.6}>
      <mesh ref={ref} scale={1.2}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.15}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

const COLORS: Record<string, string> = {
  "prompt-engineering": "#7c5cff",
  "ai-data-eng": "#ff6b4a",
  python: "#e8b84a",
  sql: "#1fba84",
  databricks: "#ff6b4a",
  snowflake: "#3aa8d8",
  "forward-deployed": "#2ee59d",
  git: "#6b6490",
};

export function TrackScene({ track = "python" }: { track?: string }) {
  return (
    <div className="h-40 w-full overflow-hidden rounded-2xl sm:h-48">
      <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 2, 2]} intensity={1.1} />
        <Crystal color={COLORS[track] ?? "#ff6b4a"} />
      </Canvas>
    </div>
  );
}
