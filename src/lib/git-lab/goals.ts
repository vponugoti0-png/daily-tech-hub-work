import { ancestors, headCommitId, isAncestor, resolveRef } from "./engine";
import type { GoalCheck, GoalStatus, RepoState } from "./types";

function commitCount(state: RepoState, ref: string): number {
  const id = resolveRef(state, ref);
  return id ? ancestors(state, id).size : 0;
}

function uniqueAhead(state: RepoState, branch: string, of: string): number {
  const tip = resolveRef(state, branch);
  const base = resolveRef(state, of);
  if (!tip || !base) return 0;
  const other = ancestors(state, base);
  let n = 0;
  for (const id of ancestors(state, tip)) {
    if (!other.has(id)) n += 1;
  }
  return n;
}

function hasMergeOn(state: RepoState, branch: string): boolean {
  const tip = resolveRef(state, branch);
  if (!tip) return false;
  for (const id of ancestors(state, tip)) {
    if ((state.commits[id]?.parents.length ?? 0) > 1) return true;
  }
  return false;
}

export function checkGoal(state: RepoState, check: GoalCheck): boolean {
  switch (check.type) {
    case "head":
      return state.HEAD.type === "branch" && state.HEAD.name === check.branch;
    case "branchExists":
      return Boolean(state.branches[check.name]);
    case "contains": {
      const tip = resolveRef(state, check.branch);
      const target = resolveRef(state, check.ref);
      if (!tip || !target) return false;
      return tip === target || isAncestor(state, target, tip);
    }
    case "ahead":
      return uniqueAhead(state, check.branch, check.of) >= check.min;
    case "sameCommit": {
      const a = resolveRef(state, check.a);
      const b = resolveRef(state, check.b);
      return Boolean(a && b && a === b);
    }
    case "at":
      return resolveRef(state, check.ref) === check.commit;
    case "commitCount":
      return commitCount(state, check.ref) >= check.min;
    case "noMergeOn":
      return !hasMergeOn(state, check.branch);
    default:
      return false;
  }
}

export function evaluateGoals(state: RepoState, checks: GoalCheck[]): GoalStatus[] {
  return checks.map((c) => ({ label: c.label, passed: checkGoal(state, c) }));
}

export function allGoalsPassed(state: RepoState, checks: GoalCheck[]): boolean {
  return checks.every((c) => checkGoal(state, c));
}

export function headName(state: RepoState): string {
  return state.HEAD.type === "branch" ? state.HEAD.name : `detached@${headCommitId(state)}`;
}
