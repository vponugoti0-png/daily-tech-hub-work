"use client";

import { describeRepo, layoutRepo } from "@/lib/git-lab/layout";
import type { RepoState } from "@/lib/git-lab/types";

const KIND_FILL: Record<string, string> = {
  head: "var(--coral)",
  branch: "var(--mint)",
  remote: "var(--sky)",
};

export function GitCommitTree({
  state,
  title,
  compact = false,
}: {
  state: RepoState;
  title: string;
  compact?: boolean;
}) {
  const layout = layoutRepo(state);
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  const vbH = Math.max(compact ? 140 : 180, layout.height);
  const vbW = Math.max(280, layout.width);

  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {title}
      </figcaption>
      <svg
        role="img"
        aria-label={describeRepo(state)}
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full overflow-visible rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/70"
        style={{ minHeight: compact ? 140 : 200 }}
      >
        {layout.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const midX = (a.x + b.x) / 2;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={`M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`}
              fill="none"
              stroke="var(--ink-border)"
              strokeWidth={2}
            />
          );
        })}
        {layout.nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill="var(--panel)"
              stroke="var(--violet)"
              strokeWidth={2.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className="fill-[var(--ink-fg)]"
              style={{ fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}
            >
              {n.id}
            </text>
            <title>{`${n.id}: ${n.message}`}</title>
          </g>
        ))}
        {layout.labels.map((l) => (
          <g key={`${l.kind}-${l.name}-${l.commit}`}>
            <rect
              x={l.x}
              y={l.y - 10}
              rx={6}
              width={Math.max(48, l.name.length * 6.2 + 12)}
              height={16}
              fill={KIND_FILL[l.kind] ?? "var(--muted)"}
              opacity={0.2}
            />
            <text
              x={l.x + 6}
              y={l.y + 2}
              style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--font-display), sans-serif" }}
              fill={KIND_FILL[l.kind] ?? "var(--muted)"}
            >
              {l.name}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
