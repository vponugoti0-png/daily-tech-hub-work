export type CommitId = string;

export interface GitCommit {
  id: CommitId;
  parents: CommitId[];
  message: string;
}

export type HeadState =
  | { kind: "branch"; name: string }
  | { kind: "detached"; id: CommitId };

export interface GitRepo {
  commits: Record<CommitId, GitCommit>;
  branches: Record<string, CommitId>;
  HEAD: HeadState;
  remotes: Record<string, Record<string, CommitId>>;
  server: Record<string, Record<string, CommitId>>;
  nextId: number;
}

export interface CommandResult {
  ok: boolean;
  output: string;
  repo: GitRepo;
}

export function emptyRepo(): GitRepo {
  return {
    commits: {},
    branches: {},
    HEAD: { kind: "branch", name: "main" },
    remotes: { origin: {} },
    server: { origin: {} },
    nextId: 0,
  };
}

export function cloneRepo(repo: GitRepo): GitRepo {
  const commits: Record<CommitId, GitCommit> = {};
  for (const [id, commit] of Object.entries(repo.commits)) {
    commits[id] = { id: commit.id, parents: [...commit.parents], message: commit.message };
  }
  const remotes: GitRepo["remotes"] = {};
  for (const [name, branches] of Object.entries(repo.remotes)) {
    remotes[name] = { ...branches };
  }
  const server: GitRepo["server"] = {};
  for (const [name, branches] of Object.entries(repo.server)) {
    server[name] = { ...branches };
  }
  return {
    commits,
    branches: { ...repo.branches },
    HEAD: { ...repo.HEAD },
    remotes,
    server,
    nextId: repo.nextId,
  };
}

export function headCommit(repo: GitRepo): CommitId {
  if (repo.HEAD.kind === "branch") {
    const tip = repo.branches[repo.HEAD.name];
    if (!tip) throw new Error(`branch '${repo.HEAD.name}' has no commits yet`);
    return tip;
  }
  return repo.HEAD.id;
}

export function tryHeadCommit(repo: GitRepo): CommitId | undefined {
  try {
    return headCommit(repo);
  } catch {
    return undefined;
  }
}

function allocId(repo: GitRepo): CommitId {
  const id = `C${repo.nextId}`;
  repo.nextId += 1;
  return id;
}

function rewrittenId(original: CommitId): CommitId {
  return `${original}'`;
}

export function placeCommit(repo: GitRepo, message: string, parents: CommitId[]): CommitId {
  const id = allocId(repo);
  repo.commits[id] = { id, parents, message };
  if (repo.HEAD.kind === "branch") {
    repo.branches[repo.HEAD.name] = id;
  } else {
    repo.HEAD = { kind: "detached", id };
  }
  return id;
}

export function reachableFrom(repo: GitRepo, start: CommitId | undefined): Set<CommitId> {
  const seen = new Set<CommitId>();
  if (!start || !repo.commits[start]) return seen;
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const commit = repo.commits[id];
    if (commit) stack.push(...commit.parents);
  }
  return seen;
}

export function isAncestor(repo: GitRepo, ancestor: CommitId, descendant: CommitId): boolean {
  return reachableFrom(repo, descendant).has(ancestor);
}

/** First-parent commits reachable from `tip` that are not reachable from `base`. Oldest first. */
export function commitsAhead(repo: GitRepo, tip: CommitId, base: CommitId): CommitId[] {
  const baseSet = reachableFrom(repo, base);
  const out: CommitId[] = [];
  let cur: CommitId | undefined = tip;
  const guard = new Set<CommitId>();
  while (cur && !baseSet.has(cur) && !guard.has(cur)) {
    guard.add(cur);
    out.push(cur);
    cur = repo.commits[cur]?.parents[0];
  }
  return out.reverse();
}

function resolveName(repo: GitRepo, name: string): CommitId {
  if (name === "HEAD") {
    const tip = tryHeadCommit(repo);
    if (!tip) throw new Error("HEAD does not point at a commit yet");
    return tip;
  }
  if (repo.branches[name]) return repo.branches[name];
  const slash = name.indexOf("/");
  if (slash > 0) {
    const remote = name.slice(0, slash);
    const branch = name.slice(slash + 1);
    const tip = repo.remotes[remote]?.[branch];
    if (tip) return tip;
  }
  if (repo.commits[name]) return name;
  throw new Error(`unknown ref '${name}'`);
}

export function resolveRef(repo: GitRepo, raw: string): CommitId {
  const ref = raw.trim();
  if (!ref) throw new Error("empty ref");
  const ops: Array<{ op: "~" | "^"; n: number }> = [];
  let name = ref;
  const opRe = /([~^])(\d*)$/;
  while (true) {
    const match = name.match(opRe);
    if (!match) break;
    ops.unshift({ op: match[1] as "~" | "^", n: match[2] === "" ? 1 : Number(match[2]) });
    name = name.slice(0, name.length - match[0].length);
  }
  if (!name) throw new Error(`unknown ref '${ref}'`);
  let id = resolveName(repo, name);
  for (const { op, n } of ops) {
    if (n < 1) throw new Error(`invalid relative ref '${ref}'`);
    if (op === "~") {
      for (let i = 0; i < n; i += 1) {
        const parent = repo.commits[id]?.parents[0];
        if (!parent) throw new Error(`${ref} walks past the root`);
        id = parent;
      }
    } else {
      const parent = repo.commits[id]?.parents[n - 1];
      if (!parent) throw new Error(`${ref} has no parent ${n}`);
      id = parent;
    }
  }
  return id;
}

export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: "'" | '"' | null = null;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      continue;
    }
    cur += ch;
  }
  if (quote) throw new Error("unclosed quote in command");
  if (cur) out.push(cur);
  return out;
}

function takeMessage(args: string[]): { message?: string; rest: string[] } {
  const rest: string[] = [];
  let message: string | undefined;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "-m" || arg === "--message") {
      message = args[i + 1];
      i += 1;
      continue;
    }
    if (arg.startsWith("-m=") || arg.startsWith("--message=")) {
      message = arg.slice(arg.indexOf("=") + 1);
      continue;
    }
    rest.push(arg);
  }
  return { message, rest };
}

function validBranchName(name: string): boolean {
  return /^[A-Za-z0-9._][A-Za-z0-9._\-/]*$/.test(name) && !name.includes("//") && !name.endsWith("/");
}

function setHeadBranch(repo: GitRepo, name: string, start: CommitId) {
  repo.branches[name] = start;
  repo.HEAD = { kind: "branch", name };
}

function currentBranch(repo: GitRepo): string | undefined {
  return repo.HEAD.kind === "branch" ? repo.HEAD.name : undefined;
}

function aheadBehind(
  repo: GitRepo,
  local: CommitId | undefined,
  remote: CommitId | undefined,
): { ahead: number; behind: number } {
  if (!local || !remote) return { ahead: 0, behind: 0 };
  return {
    ahead: commitsAhead(repo, local, remote).length,
    behind: commitsAhead(repo, remote, local).length,
  };
}

function doCommit(repo: GitRepo, args: string[]): string {
  const { message } = takeMessage(args);
  const parents = tryHeadCommit(repo) ? [headCommit(repo)] : [];
  const id = placeCommit(repo, message?.trim() || "work on aurora marts", parents);
  return `[${id}] ${repo.commits[id].message}`;
}

function doBranch(repo: GitRepo, args: string[]): string {
  if (args.includes("-d") || args.includes("-D")) {
    const name = args.find((a) => a !== "-d" && a !== "-D");
    if (!name) throw new Error("git branch -d needs a name");
    if (currentBranch(repo) === name) throw new Error(`cannot delete the branch you are on (${name})`);
    if (!repo.branches[name]) throw new Error(`branch '${name}' not found`);
    delete repo.branches[name];
    return `Deleted branch ${name}`;
  }
  if (!args.length) {
    const current = currentBranch(repo);
    return Object.keys(repo.branches)
      .sort()
      .map((name) => `${name === current ? "* " : "  "}${name}  ${repo.branches[name]}`)
      .join("\n");
  }
  const name = args[0];
  if (!validBranchName(name)) throw new Error(`invalid branch name '${name}'`);
  if (repo.branches[name]) throw new Error(`branch '${name}' already exists`);
  const start = args[1] ? resolveRef(repo, args[1]) : headCommit(repo);
  repo.branches[name] = start;
  return `Created branch ${name} at ${start}`;
}

function doCheckout(repo: GitRepo, args: string[]): string {
  const create = args.includes("-b") || args.includes("-B");
  const rest = args.filter((a) => a !== "-b" && a !== "-B");
  if (create) {
    const name = rest[0];
    if (!name || !validBranchName(name)) throw new Error("git checkout -b needs a valid branch name");
    if (repo.branches[name] && !args.includes("-B")) throw new Error(`branch '${name}' already exists`);
    const start = rest[1] ? resolveRef(repo, rest[1]) : headCommit(repo);
    setHeadBranch(repo, name, start);
    return `Switched to a new branch '${name}' at ${start}`;
  }
  const ref = rest[0];
  if (!ref) throw new Error("git checkout needs a branch or commit");
  if (repo.branches[ref]) {
    repo.HEAD = { kind: "branch", name: ref };
    return `Switched to branch '${ref}' (${repo.branches[ref]})`;
  }
  const id = resolveRef(repo, ref);
  repo.HEAD = { kind: "detached", id };
  return `HEAD is now detached at ${id} — create a branch before you commit a mart story`;
}

function doSwitch(repo: GitRepo, args: string[]): string {
  const create = args.includes("-c") || args.includes("-C") || args.includes("--create");
  const rest = args.filter((a) => a !== "-c" && a !== "-C" && a !== "--create");
  if (create) return doCheckout(repo, ["-b", ...rest]);
  return doCheckout(repo, rest);
}

function doMerge(repo: GitRepo, args: string[]): string {
  const ref = args.find((a) => !a.startsWith("-"));
  if (!ref) throw new Error("git merge needs a branch or commit");
  const theirs = resolveRef(repo, ref);
  const ours = headCommit(repo);
  if (ours === theirs || isAncestor(repo, theirs, ours)) return "Already up to date.";
  if (isAncestor(repo, ours, theirs)) {
    if (repo.HEAD.kind === "branch") repo.branches[repo.HEAD.name] = theirs;
    else repo.HEAD = { kind: "detached", id: theirs };
    return `Fast-forward to ${theirs}`;
  }
  const id = placeCommit(repo, `Merge ${ref}`, [ours, theirs]);
  return `Merge commit ${id} (parents ${ours}, ${theirs})`;
}

function doRebase(repo: GitRepo, args: string[]): string {
  if (args.includes("-i") || args.includes("--interactive") || args.includes("--abort") || args.includes("--continue")) {
    throw new Error("interactive rebase is not simulated — use git rebase <onto>, or reset the level");
  }
  const ontoName = args.find((a) => !a.startsWith("-"));
  if (!ontoName) throw new Error("git rebase needs a target (main or origin/main)");
  const onto = resolveRef(repo, ontoName);
  const tip = headCommit(repo);
  if (tip === onto || (isAncestor(repo, onto, tip) && commitsAhead(repo, tip, onto).length === 0)) {
    return "Already up to date.";
  }
  const unique = commitsAhead(repo, tip, onto);
  if (!unique.length) {
    if (repo.HEAD.kind === "branch") repo.branches[repo.HEAD.name] = onto;
    else repo.HEAD = { kind: "detached", id: onto };
    return `Fast-forward rebase onto ${ontoName} (${onto})`;
  }
  if (unique.some((id) => (repo.commits[id]?.parents.length ?? 0) > 1)) {
    throw new Error("this lab rebases linear personal branches — reset and avoid merge commits on the feature");
  }
  let cursor = onto;
  const replayed: string[] = [];
  for (const oldId of unique) {
    let next = rewrittenId(oldId);
    while (repo.commits[next]) next = rewrittenId(next);
    const old = repo.commits[oldId];
    repo.commits[next] = { id: next, parents: [cursor], message: old.message };
    replayed.push(`${oldId} → ${next}`);
    cursor = next;
  }
  if (repo.HEAD.kind === "branch") repo.branches[repo.HEAD.name] = cursor;
  else repo.HEAD = { kind: "detached", id: cursor };
  return `Rebased ${unique.length} commit(s) onto ${ontoName} (${onto})\n${replayed.join("\n")}`;
}

function doCherryPick(repo: GitRepo, args: string[]): string {
  const ref = args.find((a) => !a.startsWith("-"));
  if (!ref) throw new Error("git cherry-pick needs a commit or branch");
  const srcId = resolveRef(repo, ref);
  const src = repo.commits[srcId];
  if (!src) throw new Error(`unknown commit '${ref}'`);
  if (src.parents.length > 1) throw new Error("cannot cherry-pick a merge commit in this lab");
  const parent = headCommit(repo);
  const id = placeCommit(repo, src.message, [parent]);
  return `Cherry-picked ${srcId} → ${id}  ${src.message}`;
}

function doReset(repo: GitRepo, args: string[]): string {
  const ref = args.find((a) => !a.startsWith("-")) ?? "HEAD";
  const target = resolveRef(repo, ref);
  if (repo.HEAD.kind === "branch") repo.branches[repo.HEAD.name] = target;
  else repo.HEAD = { kind: "detached", id: target };
  const mode = args.includes("--soft") ? "soft" : args.includes("--mixed") ? "mixed" : "hard";
  return `HEAD is now ${target} (${mode} reset — this lab has no index or worktree)`;
}

function doLog(repo: GitRepo): string {
  const start = tryHeadCommit(repo);
  if (!start) return "(empty)";
  const lines: string[] = [];
  let cur: CommitId | undefined = start;
  const seen = new Set<CommitId>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const node: GitCommit | undefined = repo.commits[cur];
    if (!node) break;
    lines.push(`${node.id}  ${node.message}`);
    cur = node.parents[0];
  }
  return lines.join("\n");
}

function doStatus(repo: GitRepo): string {
  const lines: string[] = [];
  if (repo.HEAD.kind === "branch") {
    lines.push(`On branch ${repo.HEAD.name}`);
    const local = repo.branches[repo.HEAD.name];
    const remote = repo.remotes.origin?.[repo.HEAD.name] ?? repo.remotes.origin?.main;
    if (local && remote) {
      const { ahead, behind } = aheadBehind(repo, local, remote);
      if (ahead || behind) {
        lines.push(`Your branch and origin are diverged (ahead ${ahead}, behind ${behind}).`);
      } else {
        lines.push("Your branch matches the simulated origin ref.");
      }
    }
  } else {
    lines.push(`HEAD detached at ${repo.HEAD.id}`);
  }
  lines.push("nothing to commit — this lab has no worktree; git commit always records a graph node");
  return lines.join("\n");
}

function doFetch(repo: GitRepo, args: string[]): string {
  const remote = args.find((a) => !a.startsWith("-")) ?? "origin";
  const server = repo.server[remote];
  if (!server) throw new Error(`unknown remote '${remote}'`);
  repo.remotes[remote] = { ...server };
  const names = Object.entries(server)
    .map(([branch, id]) => `${remote}/${branch} → ${id}`)
    .join("\n");
  return names ? `Fetched ${remote}\n${names}` : `Fetched ${remote} (no remote branches)`;
}

function doPull(repo: GitRepo, args: string[]): string {
  const fetchOut = doFetch(repo, args);
  const branch = currentBranch(repo) ?? "main";
  const remote = args.find((a) => !a.startsWith("-")) ?? "origin";
  const want = repo.remotes[remote]?.[branch] ? `${remote}/${branch}` : `${remote}/main`;
  if (!repo.remotes[remote] || !Object.values(repo.remotes[remote]).length) {
    return `${fetchOut}\nNo remote-tracking branch to merge.`;
  }
  const mergeOut = doMerge(repo, [want]);
  return `${fetchOut}\n${mergeOut}`;
}

function doPush(repo: GitRepo, args: string[]): string {
  const positional = args.filter((a) => !a.startsWith("-"));
  let remoteName = "origin";
  let branch = currentBranch(repo) ?? "main";
  if (positional[0] && (positional[0] === "origin" || repo.remotes[positional[0]] || repo.server[positional[0]])) {
    remoteName = positional[0];
    if (positional[1]) branch = positional[1];
  } else if (positional[0]) {
    branch = positional[0];
  }
  const tip = repo.branches[branch];
  if (!tip) throw new Error(`nothing to push from '${branch}'`);
  if (!repo.server[remoteName]) repo.server[remoteName] = {};
  if (!repo.remotes[remoteName]) repo.remotes[remoteName] = {};
  repo.server[remoteName][branch] = tip;
  repo.remotes[remoteName][branch] = tip;
  return `Updated simulated ${remoteName}/${branch} → ${tip}. No network push to GitHub.`;
}

function doRemote(repo: GitRepo, args: string[]): string {
  const verbose = args.includes("-v") || args.includes("--verbose");
  const names = Object.keys(repo.remotes);
  if (!names.length) return "No remotes. This lab starts with origin as a local simulation.";
  if (!verbose) return names.join("\n");
  return names
    .map((name) => `${name}\tlocal-simulation (fetch)\n${name}\tlocal-simulation (push)`)
    .join("\n");
}

const HELP = `Git Play Lab — in-browser graph only (no VM, no GitHub).

commit [-m msg]          record a node on HEAD
branch [name] [-d name]  list / create / delete
checkout <ref> | -b name [start]
switch <name> | -c name
merge <ref>              merge or fast-forward
rebase <onto>            replay linear commits (personal branches)
cherry-pick <ref>        copy one commit onto HEAD
reset [--hard] <ref>     move HEAD (HEAD~ / HEAD^ work)
log [--oneline]          first-parent history
status                   branch + simulated origin
fetch [origin]           update origin/* from the simulated server
pull                     fetch + merge
push                     update simulated origin only
remote -v                list remotes
help                     this list

Relative refs: HEAD, HEAD~1, HEAD^, main~2, origin/main, C2.`;

export function runGitCommand(inputRepo: GitRepo, line: string): CommandResult {
  const repo = cloneRepo(inputRepo);
  try {
    const tokens = tokenize(line.trim());
    if (!tokens.length) return { ok: false, output: "", repo: inputRepo };
    if (tokens[0] === "git") tokens.shift();
    if (!tokens.length) return { ok: false, output: "Type a command after git — or just commit, rebase, …", repo: inputRepo };
    const [cmd, ...args] = tokens;
    let output: string;
    switch (cmd) {
      case "commit":
        output = doCommit(repo, args);
        break;
      case "branch":
        output = doBranch(repo, args);
        break;
      case "checkout":
        output = doCheckout(repo, args);
        break;
      case "switch":
        output = doSwitch(repo, args);
        break;
      case "merge":
        output = doMerge(repo, args);
        break;
      case "rebase":
        output = doRebase(repo, args);
        break;
      case "cherry-pick":
        output = doCherryPick(repo, args);
        break;
      case "reset":
        output = doReset(repo, args);
        break;
      case "log":
        output = doLog(repo);
        break;
      case "status":
        output = doStatus(repo);
        break;
      case "fetch":
        output = doFetch(repo, args);
        break;
      case "pull":
        output = doPull(repo, args);
        break;
      case "push":
        output = doPush(repo, args);
        break;
      case "remote":
        output = doRemote(repo, args);
        break;
      case "help":
      case "--help":
        output = HELP;
        break;
      default:
        throw new Error(`unknown command '${cmd}' — try help`);
    }
    return { ok: true, output, repo };
  } catch (err) {
    return {
      ok: false,
      output: err instanceof Error ? err.message : "Command failed",
      repo: inputRepo,
    };
  }
}

export function graphSummary(repo: GitRepo): string {
  const parts: string[] = [];
  if (repo.HEAD.kind === "branch") {
    parts.push(`HEAD on ${repo.HEAD.name} at ${repo.branches[repo.HEAD.name] ?? "?"}`);
  } else {
    parts.push(`HEAD detached at ${repo.HEAD.id}`);
  }
  const locals = Object.entries(repo.branches)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, id]) => `${name} @ ${id}`);
  if (locals.length) parts.push(`branches ${locals.join(", ")}`);
  const remotes = Object.entries(repo.remotes).flatMap(([remote, branches]) =>
    Object.entries(branches).map(([branch, id]) => `${remote}/${branch} @ ${id}`),
  );
  if (remotes.length) parts.push(`remotes ${remotes.join(", ")}`);
  return parts.join(". ");
}

export interface GraphNode {
  id: CommitId;
  x: number;
  y: number;
  message: string;
}

export interface GraphEdge {
  from: CommitId;
  to: CommitId;
  merge: boolean;
}

export interface GraphLabel {
  text: string;
  commitId: CommitId;
  kind: "head" | "branch" | "remote";
}

export interface GraphLayout {
  nodes: GraphNode[];
  edges: GraphEdge[];
  labels: GraphLabel[];
  width: number;
  height: number;
}

const COL_W = 78;
const ROW_H = 62;
const PAD_X = 36;
const PAD_Y = 44;

export function layoutGraph(repo: GitRepo): GraphLayout {
  const ids = Object.keys(repo.commits);
  const generation = new Map<CommitId, number>();
  const visiting = new Set<CommitId>();
  const gen = (id: CommitId): number => {
    const cached = generation.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const parents = repo.commits[id]?.parents ?? [];
    const value = parents.length ? 1 + Math.max(...parents.map(gen)) : 0;
    generation.set(id, value);
    visiting.delete(id);
    return value;
  };
  for (const id of ids) gen(id);

  const lane = new Map<CommitId, number>();
  let nextLane = 0;
  const paintChain = (start: CommitId | undefined) => {
    let cur = start;
    const seen = new Set<CommitId>();
    let assigned = false;
    while (cur && repo.commits[cur] && !seen.has(cur)) {
      seen.add(cur);
      if (!lane.has(cur)) {
        if (!assigned) {
          assigned = true;
        }
        lane.set(cur, nextLane);
      }
      cur = repo.commits[cur].parents[0];
    }
    if (assigned) nextLane += 1;
  };

  const current = currentBranch(repo);
  if (current) paintChain(repo.branches[current]);
  if (repo.HEAD.kind === "detached") paintChain(repo.HEAD.id);
  paintChain(repo.branches.main);
  for (const name of Object.keys(repo.branches).sort()) {
    if (name === current || name === "main") continue;
    paintChain(repo.branches[name]);
  }
  for (const remote of Object.keys(repo.remotes).sort()) {
    for (const branch of Object.keys(repo.remotes[remote]).sort()) {
      paintChain(repo.remotes[remote][branch]);
    }
  }
  for (const id of ids.sort((a, b) => (generation.get(a) ?? 0) - (generation.get(b) ?? 0))) {
    if (!lane.has(id)) {
      lane.set(id, nextLane);
      nextLane += 1;
    }
  }

  const nodes: GraphNode[] = ids.map((id) => ({
    id,
    x: PAD_X + (generation.get(id) ?? 0) * COL_W,
    y: PAD_Y + (lane.get(id) ?? 0) * ROW_H,
    message: repo.commits[id].message,
  }));

  const edges: GraphEdge[] = [];
  for (const commit of Object.values(repo.commits)) {
    commit.parents.forEach((parent, index) => {
      edges.push({ from: commit.id, to: parent, merge: index > 0 });
    });
  }

  const labels: GraphLabel[] = [];
  if (repo.HEAD.kind === "branch") {
    const tip = repo.branches[repo.HEAD.name];
    if (tip) labels.push({ text: "HEAD", commitId: tip, kind: "head" });
  } else {
    labels.push({ text: "HEAD", commitId: repo.HEAD.id, kind: "head" });
  }
  for (const [name, id] of Object.entries(repo.branches)) {
    labels.push({ text: name, commitId: id, kind: "branch" });
  }
  for (const [remote, branches] of Object.entries(repo.remotes)) {
    for (const [branch, id] of Object.entries(branches)) {
      labels.push({ text: `${remote}/${branch}`, commitId: id, kind: "remote" });
    }
  }

  const maxX = nodes.reduce((m, n) => Math.max(m, n.x), PAD_X);
  const maxY = nodes.reduce((m, n) => Math.max(m, n.y), PAD_Y);
  return {
    nodes,
    edges,
    labels,
    width: maxX + PAD_X + 48,
    height: maxY + PAD_Y + 28,
  };
}
