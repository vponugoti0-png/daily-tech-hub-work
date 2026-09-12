import { parseGitCommand } from "./parse";
import type { CommandResult, CommitId, GitCommit, RepoState } from "./types";

export function cloneRepo(state: RepoState): RepoState {
  return {
    commits: Object.fromEntries(
      Object.entries(state.commits).map(([id, c]) => [id, { ...c, parents: [...c.parents] }]),
    ),
    branches: { ...state.branches },
    HEAD: { ...state.HEAD },
    remoteTracking: { ...state.remoteTracking },
    remoteRepo: { ...state.remoteRepo },
    nextId: state.nextId,
  };
}

export function makeRepo(partial: {
  commits: GitCommit[];
  branches: Record<string, CommitId>;
  head: string;
  remoteTracking?: Record<string, CommitId>;
  remoteRepo?: Record<string, CommitId>;
}): RepoState {
  const commits: Record<CommitId, GitCommit> = {};
  let max = 0;
  for (const c of partial.commits) {
    commits[c.id] = { ...c, parents: [...c.parents] };
    const n = Number(String(c.id).replace(/^C/i, ""));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return {
    commits,
    branches: { ...partial.branches },
    HEAD: { type: "branch", name: partial.head },
    remoteTracking: { ...(partial.remoteTracking ?? {}) },
    remoteRepo: { ...(partial.remoteRepo ?? {}) },
    nextId: max + 1,
  };
}

export function headCommitId(state: RepoState): CommitId {
  return state.HEAD.type === "branch" ? state.branches[state.HEAD.name] : state.HEAD.commit;
}

export function ancestors(state: RepoState, start: CommitId | undefined): Set<CommitId> {
  const seen = new Set<CommitId>();
  if (!start || !state.commits[start]) return seen;
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const c = state.commits[id];
    if (c) stack.push(...c.parents);
  }
  return seen;
}

export function isAncestor(state: RepoState, ancestor: CommitId, descendant: CommitId): boolean {
  return ancestors(state, descendant).has(ancestor);
}

function nextCommitId(state: RepoState): CommitId {
  let n = state.nextId;
  while (state.commits[`C${n}`]) n += 1;
  return `C${n}`;
}

export function resolveRef(state: RepoState, ref: string): CommitId | undefined {
  if (!ref) return undefined;
  if (ref === "HEAD") return headCommitId(state);
  const tilde = /^(HEAD|.+?)~(\d+)$/.exec(ref);
  if (tilde) {
    const base = tilde[1] === "HEAD" ? headCommitId(state) : resolveRef(state, tilde[1]);
    if (!base) return undefined;
    let cur: CommitId | undefined = base;
    const steps = Number(tilde[2]);
    for (let i = 0; i < steps; i += 1) {
      const commit: GitCommit | undefined = cur ? state.commits[cur] : undefined;
      const parents: CommitId[] | undefined = commit?.parents;
      cur = parents?.[0];
      if (!cur) return undefined;
    }
    return cur;
  }
  if (state.branches[ref]) return state.branches[ref];
  if (state.remoteTracking[ref]) return state.remoteTracking[ref];
  const upper = ref.toUpperCase();
  if (state.commits[upper]) return upper;
  if (state.commits[ref]) return ref;
  return undefined;
}

function moveHead(state: RepoState, commit: CommitId) {
  if (state.HEAD.type === "branch") {
    state.branches[state.HEAD.name] = commit;
  } else {
    state.HEAD = { type: "detached", commit };
  }
}

function addCommit(state: RepoState, parents: CommitId[], message: string): GitCommit {
  const id = nextCommitId(state);
  const commit: GitCommit = { id, parents, message };
  state.commits[id] = commit;
  state.nextId = Number(id.slice(1)) + 1;
  moveHead(state, id);
  return commit;
}

function currentBranch(state: RepoState): string | undefined {
  return state.HEAD.type === "branch" ? state.HEAD.name : undefined;
}

function uniqueFirstParentChain(state: RepoState, tip: CommitId, onto: CommitId): GitCommit[] {
  const ontoSet = ancestors(state, onto);
  const chain: GitCommit[] = [];
  let cur: CommitId | undefined = tip;
  while (cur && !ontoSet.has(cur)) {
    const c: GitCommit | undefined = state.commits[cur];
    if (!c) break;
    chain.push(c);
    cur = c.parents[0];
  }
  return chain.reverse();
}

function decorate(state: RepoState, id: CommitId): string {
  const tags: string[] = [];
  if (headCommitId(state) === id) tags.push("HEAD");
  for (const [name, tip] of Object.entries(state.branches)) {
    if (tip === id) tags.push(name);
  }
  for (const [name, tip] of Object.entries(state.remoteTracking)) {
    if (tip === id) tags.push(name);
  }
  return tags.length ? ` (${tags.join(", ")})` : "";
}

function helpText(): string {
  return [
    "Git Play Lab — in-browser model (not a real repo, not a VM).",
    "Supported: status, log [--oneline], commit [-m], branch, checkout/switch [-b/-c],",
    "merge, rebase, reset [--soft|--hard] HEAD~n, fetch, pull [--rebase], push, remote, help.",
    "Remotes are a same-origin mock named origin. No git egress.",
  ].join("\n");
}

function statusText(state: RepoState): string {
  const head = state.HEAD.type === "branch" ? `On branch ${state.HEAD.name}` : `HEAD detached at ${state.HEAD.commit}`;
  const id = headCommitId(state);
  const msg = state.commits[id]?.message ?? "";
  const lines = [head, `HEAD is ${id} — ${msg}`];
  const origin = state.remoteTracking["origin/main"];
  if (origin) {
    const local = state.branches.main;
    if (local && origin === local) lines.push("Your branch is up to date with origin/main (mock).");
    else if (local && isAncestor(state, origin, local)) lines.push("Your branch is ahead of origin/main (mock).");
    else if (local && isAncestor(state, local, origin)) lines.push("Your branch is behind origin/main (mock) — fetch/rebase.");
    else lines.push("Your branch and origin/main have diverged (mock).");
  }
  lines.push("Nothing to stage — this model commits a new node when you run git commit.");
  return lines.join("\n");
}

function logText(state: RepoState, oneline: boolean): string {
  const id = headCommitId(state);
  if (!id) return "fatal: your current branch does not have any commits yet";
  const order: GitCommit[] = [];
  const seen = new Set<CommitId>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.shift()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const c = state.commits[cur];
    if (!c) continue;
    order.push(c);
    stack.push(...c.parents);
  }
  return order
    .map((c) =>
      oneline
        ? `${c.id}${decorate(state, c.id)} ${c.message}`
        : `commit ${c.id}${decorate(state, c.id)}\n    ${c.message}\n`,
    )
    .join("\n");
}

function cmdCommit(state: RepoState, message?: string): CommandResult {
  const next = cloneRepo(state);
  const msg = (message ?? "").trim() || "feat(marts): checkpoint";
  const parent = headCommitId(next);
  if (!parent) return { ok: false, output: "fatal: no HEAD to commit on", state };
  const c = addCommit(next, [parent], msg);
  return { ok: true, output: `[${currentBranch(next) ?? "detached"} ${c.id}] ${c.message}`, state: next };
}

function cmdBranch(state: RepoState, create?: string, list?: boolean): CommandResult {
  if (create) {
    if (state.branches[create]) return { ok: false, output: `fatal: a branch named '${create}' already exists`, state };
    const next = cloneRepo(state);
    next.branches[create] = headCommitId(next);
    return { ok: true, output: "", state: next };
  }
  if (list !== false) {
    const cur = currentBranch(state);
    const names = Object.keys(state.branches).sort();
    return {
      ok: true,
      output: names.map((n) => `${n === cur ? "* " : "  "}${n}`).join("\n"),
      state,
    };
  }
  return { ok: true, output: "", state };
}

function cmdCheckout(state: RepoState, target: string | undefined, create: boolean): CommandResult {
  if (!target) return { ok: false, output: "fatal: missing branch name", state };
  const next = cloneRepo(state);
  if (create) {
    if (next.branches[target]) return { ok: false, output: `fatal: a branch named '${target}' already exists`, state };
    next.branches[target] = headCommitId(next);
  }
  if (next.branches[target]) {
    next.HEAD = { type: "branch", name: target };
    return {
      ok: true,
      output: create
        ? `Switched to a new branch '${target}'`
        : `Switched to branch '${target}'`,
      state: next,
    };
  }
  const commit = resolveRef(next, target);
  if (!commit) return { ok: false, output: `error: pathspec '${target}' did not match any known ref`, state };
  next.HEAD = { type: "detached", commit };
  return { ok: true, output: `HEAD is now at ${commit} (detached — demo only)`, state: next };
}

function cmdMerge(state: RepoState, target: string | undefined): CommandResult {
  if (!target) return { ok: false, output: "fatal: missing branch to merge", state };
  const theirs = resolveRef(state, target);
  if (!theirs) return { ok: false, output: `merge: ${target} — not something we can merge`, state };
  const ours = headCommitId(state);
  if (ours === theirs || isAncestor(state, theirs, ours)) {
    return { ok: true, output: "Already up to date.", state };
  }
  const next = cloneRepo(state);
  if (isAncestor(next, ours, theirs)) {
    moveHead(next, theirs);
    return { ok: true, output: `Updating ${ours}..${theirs}\nFast-forward`, state: next };
  }
  const c = addCommit(next, [ours, theirs], `Merge branch '${target}'`);
  return { ok: true, output: `Merge made by the 'ort' strategy (${c.id}).`, state: next };
}

function cmdRebase(state: RepoState, target: string | undefined): CommandResult {
  if (!target) return { ok: false, output: "fatal: missing rebase onto ref", state };
  const onto = resolveRef(state, target);
  if (!onto) return { ok: false, output: `fatal: invalid upstream '${target}'`, state };
  const tip = headCommitId(state);
  const branch = currentBranch(state);
  if (!branch) return { ok: false, output: "fatal: rebase onto a detached HEAD is not supported in this model", state };
  if (tip === onto || isAncestor(state, onto, tip)) {
    return { ok: true, output: `Current branch ${branch} is up to date.`, state };
  }
  const chain = uniqueFirstParentChain(state, tip, onto);
  const next = cloneRepo(state);
  next.HEAD = { type: "branch", name: branch };
  if (!chain.length) {
    next.branches[branch] = onto;
    return {
      ok: true,
      output: `Fast-forwarded ${branch} to ${onto}.`,
      state: next,
    };
  }
  let parent = onto;
  for (const old of chain) {
    const replayed: GitCommit = { id: nextCommitId(next), parents: [parent], message: old.message };
    next.commits[replayed.id] = replayed;
    next.nextId = Number(replayed.id.slice(1)) + 1;
    parent = replayed.id;
  }
  next.branches[branch] = parent;
  return {
    ok: true,
    output: `Successfully rebased and updated refs/heads/${branch}.`,
    state: next,
  };
}

function cmdReset(state: RepoState, target: string | undefined, mode: "soft" | "mixed" | "hard"): CommandResult {
  const dest = resolveRef(state, target ?? "HEAD");
  if (!dest) return { ok: false, output: `fatal: ambiguous argument '${target}'`, state };
  const head = state.HEAD;
  if (head.type !== "branch") {
    return { ok: false, output: "fatal: reset on detached HEAD is not supported in this model", state };
  }
  const next = cloneRepo(state);
  next.branches[head.name] = dest;
  const note =
    mode === "hard"
      ? "HEAD moved (hard). This model has no working tree — the branch pointer is the whole story."
      : "HEAD moved. Index/worktree are not modeled; --soft/--mixed/--hard all move the branch tip.";
  return { ok: true, output: `${note}\nHEAD is now at ${dest}`, state: next };
}

function cmdFetch(state: RepoState): CommandResult {
  const next = cloneRepo(state);
  const lines: string[] = [];
  for (const [name, id] of Object.entries(next.remoteRepo)) {
    const track = `origin/${name}`;
    const prev = next.remoteTracking[track];
    next.remoteTracking[track] = id;
    lines.push(prev === id ? `= [up to date]      ${name}       -> ${track}` : `* [new/updated]     ${name}       -> ${track}`);
  }
  if (!lines.length) lines.push("From origin (mock)\n * nothing to fetch");
  return { ok: true, output: `From origin (same-origin mock)\n${lines.join("\n")}`, state: next };
}

function cmdPull(state: RepoState, rebase: boolean): CommandResult {
  const fetched = cmdFetch(state);
  const branch = currentBranch(fetched.state) ?? "main";
  const upstream = fetched.state.remoteTracking[`origin/${branch}`] ? `origin/${branch}` : "origin/main";
  const second = rebase
    ? cmdRebase(fetched.state, upstream)
    : cmdMerge(fetched.state, upstream);
  return {
    ok: second.ok,
    output: [fetched.output, second.output].filter(Boolean).join("\n"),
    state: second.state,
  };
}

function cmdPush(state: RepoState, remote?: string, branch?: string): CommandResult {
  if (remote && remote !== "origin") {
    return { ok: false, output: `error: unknown remote '${remote}'. Only the origin mock exists.`, state };
  }
  const name = branch ?? currentBranch(state);
  if (!name || !state.branches[name]) return { ok: false, output: "fatal: no local branch to push", state };
  const tip = state.branches[name];
  const remoteTip = state.remoteRepo[name];
  if (remoteTip && remoteTip !== tip && !isAncestor(state, remoteTip, tip)) {
    return {
      ok: false,
      output:
        " ! [rejected] non-fast-forward\nerror: failed to push (mock). Fetch and rebase your personal branch — do not force-push shared history.",
      state,
    };
  }
  const next = cloneRepo(state);
  next.remoteRepo[name] = tip;
  next.remoteTracking[`origin/${name}`] = tip;
  return { ok: true, output: `To origin (mock)\n   ${remoteTip ?? "000"}..${tip}  ${name} -> ${name}`, state: next };
}

function cmdRemote(state: RepoState): CommandResult {
  const has = Object.keys(state.remoteRepo).length || Object.keys(state.remoteTracking).length;
  return {
    ok: true,
    output: has
      ? "origin  mock://aurora/git-play-lab (fetch)\norigin  mock://aurora/git-play-lab (push)\n# same-origin mock — no egress"
      : "origin  mock://aurora/git-play-lab (not fetched yet)",
    state,
  };
}

export function runCommand(state: RepoState, line: string): CommandResult {
  const parsed = parseGitCommand(line);
  if (!parsed.ok) {
    return { ok: false, output: parsed.error, state };
  }
  const cmd = parsed.cmd;
  switch (cmd.name) {
    case "help":
      return { ok: true, output: helpText(), state };
    case "status":
      return { ok: true, output: statusText(state), state };
    case "log":
      return { ok: true, output: logText(state, cmd.oneline), state };
    case "commit":
      return cmdCommit(state, cmd.message);
    case "branch":
      return cmdBranch(state, cmd.create, cmd.list);
    case "checkout":
      return cmdCheckout(state, cmd.target, cmd.create);
    case "switch":
      return cmdCheckout(state, cmd.target, cmd.create);
    case "merge":
      return cmdMerge(state, cmd.target);
    case "rebase":
      return cmdRebase(state, cmd.target);
    case "reset":
      return cmdReset(state, cmd.target, cmd.mode);
    case "fetch":
      return cmdFetch(state);
    case "pull":
      return cmdPull(state, cmd.rebase);
    case "push":
      return cmdPush(state, cmd.remote, cmd.branch);
    case "remote":
      return cmdRemote(state);
    default:
      return { ok: false, output: "Unknown command.", state };
  }
}

export function reachableIds(state: RepoState): Set<CommitId> {
  const ids = new Set<CommitId>();
  const seeds = [
    ...Object.values(state.branches),
    ...Object.values(state.remoteTracking),
    headCommitId(state),
  ];
  for (const seed of seeds) {
    for (const id of ancestors(state, seed)) ids.add(id);
  }
  return ids;
}
