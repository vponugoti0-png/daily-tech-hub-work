import { graphSummary, layoutGraph, type GitRepo } from "./engine";

const NODE_R = 16;

function token(name: string) {
  return `var(--${name})`;
}

export function GitGraph({ repo }: { repo: GitRepo }) {
  const layout = layoutGraph(repo);
  const byId = new Map(layout.nodes.map((node) => [node.id, node]));
  const headId =
    repo.HEAD.kind === "branch" ? repo.branches[repo.HEAD.name] : repo.HEAD.id;
  const summary = graphSummary(repo);
  const labelsByCommit = new Map<string, typeof layout.labels>();
  for (const label of layout.labels) {
    const list = labelsByCommit.get(label.commitId) ?? [];
    list.push(label);
    labelsByCommit.set(label.commitId, list);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/70">
      <svg
        role="img"
        aria-label={`Commit graph. ${summary}`}
        width={Math.max(layout.width, 280)}
        height={Math.max(layout.height, 140)}
        viewBox={`0 0 ${Math.max(layout.width, 280)} ${Math.max(layout.height, 140)}`}
        className="block min-w-full"
      >
        <title>{summary}</title>
        {layout.edges.map((edge) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;
          const midX = (from.x + to.x) / 2;
          const path = `M ${to.x} ${to.y} C ${midX} ${to.y}, ${midX} ${from.y}, ${from.x} ${from.y}`;
          return (
            <path
              key={`${edge.from}-${edge.to}-${edge.merge ? "m" : "p"}`}
              d={path}
              fill="none"
              stroke={edge.merge ? token("sky") : token("violet")}
              strokeWidth={edge.merge ? 2.2 : 2}
              strokeDasharray={edge.merge ? "5 4" : undefined}
              opacity={0.85}
            />
          );
        })}
        {layout.nodes.map((node) => {
          const isHead = node.id === headId;
          const labels = labelsByCommit.get(node.id) ?? [];
          return (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <circle
                r={NODE_R + (isHead ? 4 : 0)}
                fill={isHead ? "color-mix(in oklab, var(--coral) 22%, transparent)" : "transparent"}
              />
              <circle
                r={NODE_R}
                fill={isHead ? token("coral") : token("violet")}
                stroke={token("panel")}
                strokeWidth={3}
              />
              <text
                textAnchor="middle"
                y={4}
                fill="#1a1430"
                fontSize={10}
                fontWeight={700}
                style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
              >
                {node.id}
              </text>
              <text
                textAnchor="middle"
                y={NODE_R + 14}
                fill={token("muted")}
                fontSize={9}
                style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
              >
                {node.message.length > 28 ? `${node.message.slice(0, 26)}…` : node.message}
              </text>
              {labels.map((label, index) => {
                const fill =
                  label.kind === "head"
                    ? token("sun")
                    : label.kind === "remote"
                      ? token("sky")
                      : token("mint");
                const y = -(NODE_R + 10 + index * 16);
                const width = Math.max(36, label.text.length * 6.2 + 12);
                return (
                  <g key={`${label.kind}-${label.text}`} transform={`translate(0 ${y})`}>
                    <rect
                      x={-width / 2}
                      y={-9}
                      width={width}
                      height={14}
                      rx={7}
                      fill={fill}
                    />
                    <text
                      textAnchor="middle"
                      y={2}
                      fill="#1a1430"
                      fontSize={9}
                      fontWeight={700}
                    >
                      {label.text}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
