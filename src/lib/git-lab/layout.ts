import { headCommitId, reachableIds } from "./engine";
import type { CommitId, RepoState } from "./types";

export interface TreeNode {
  id: CommitId;
  message: string;
  x: number;
  y: number;
  parents: CommitId[];
}

export interface TreeLabel {
  name: string;
  commit: CommitId;
  kind: "head" | "branch" | "remote";
  x: number;
  y: number;
}

export interface TreeLayout {
  nodes: TreeNode[];
  edges: { from: CommitId; to: CommitId }[];
  labels: TreeLabel[];
  width: number;
  height: number;
}

const COL = 88;
const ROW = 64;
const PAD_X = 36;
const PAD_Y = 40;

function generation(state: RepoState, id: CommitId, memo: Map<CommitId, number>): number {
  const hit = memo.get(id);
  if (hit !== undefined) return hit;
  const parents = state.commits[id]?.parents ?? [];
  const gen = parents.length ? Math.max(...parents.map((p) => generation(state, p, memo))) + 1 : 0;
  memo.set(id, gen);
  return gen;
}

export function layoutRepo(state: RepoState): TreeLayout {
  const ids = [...reachableIds(state)];
  const gens = new Map<CommitId, number>();
  for (const id of ids) generation(state, id, gens);

  const branchOrder = [
    ...(state.HEAD.type === "branch" ? [state.HEAD.name] : []),
    ...Object.keys(state.branches).sort(),
    ...Object.keys(state.remoteTracking).sort(),
  ];
  const lane = new Map<CommitId, number>();
  let nextLane = 0;
  for (const name of branchOrder) {
    const tip = state.branches[name] ?? state.remoteTracking[name];
    if (!tip || lane.has(tip)) continue;
    let cur: CommitId | undefined = tip;
    const assigned = nextLane;
    nextLane += 1;
    while (cur && !lane.has(cur)) {
      lane.set(cur, assigned);
      cur = state.commits[cur]?.parents[0];
    }
  }
  for (const id of ids) {
    if (!lane.has(id)) {
      lane.set(id, nextLane);
      nextLane += 1;
    }
  }

  const nodes: TreeNode[] = ids.map((id) => {
    const c = state.commits[id]!;
    return {
      id,
      message: c.message,
      x: PAD_X + (gens.get(id) ?? 0) * COL,
      y: PAD_Y + (lane.get(id) ?? 0) * ROW,
      parents: c.parents,
    };
  });

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: TreeLayout["edges"] = [];
  for (const n of nodes) {
    for (const p of n.parents) {
      if (byId.has(p)) edges.push({ from: p, to: n.id });
    }
  }

  const labels: TreeLabel[] = [];
  const used = new Map<CommitId, number>();
  function place(name: string, commit: CommitId, kind: TreeLabel["kind"]) {
    const node = byId.get(commit);
    if (!node) return;
    const slot = used.get(commit) ?? 0;
    used.set(commit, slot + 1);
    labels.push({
      name,
      commit,
      kind,
      x: node.x + 22,
      y: node.y - 22 - slot * 16,
    });
  }

  if (state.HEAD.type === "branch") {
    place(`HEAD → ${state.HEAD.name}`, headCommitId(state), "head");
  } else {
    place("HEAD", state.HEAD.commit, "head");
  }
  for (const [name, tip] of Object.entries(state.branches)) {
    if (state.HEAD.type === "branch" && state.HEAD.name === name) continue;
    place(name, tip, "branch");
  }
  for (const [name, tip] of Object.entries(state.remoteTracking)) {
    place(name, tip, "remote");
  }

  const width = Math.max(320, ...nodes.map((n) => n.x + 160), 1);
  const height = Math.max(160, ...nodes.map((n) => n.y + 48), 1);
  return { nodes, edges, labels, width, height };
}

export function describeRepo(state: RepoState): string {
  const branches = Object.entries(state.branches)
    .map(([n, id]) => `${n}=${id}`)
    .join(", ");
  const remotes = Object.entries(state.remoteTracking)
    .map(([n, id]) => `${n}=${id}`)
    .join(", ");
  const head = state.HEAD.type === "branch" ? `branch ${state.HEAD.name}` : `detached ${state.HEAD.commit}`;
  return `HEAD on ${head}. Branches: ${branches || "none"}.${remotes ? ` Tracking: ${remotes}.` : ""}`;
}
