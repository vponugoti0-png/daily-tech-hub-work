/** Client-side git model for Git Play Lab (Product A). No real repo, no VM. */

export type CommitId = string;

export interface GitCommit {
  id: CommitId;
  parents: CommitId[];
  message: string;
}

export type Head =
  | { type: "branch"; name: string }
  | { type: "detached"; commit: CommitId };

export interface RepoState {
  commits: Record<CommitId, GitCommit>;
  branches: Record<string, CommitId>;
  HEAD: Head;
  /** Local remote-tracking refs (`origin/main`). */
  remoteTracking: Record<string, CommitId>;
  /** Mock origin server branches — never leaves the browser. */
  remoteRepo: Record<string, CommitId>;
  nextId: number;
}

export interface CommandResult {
  ok: boolean;
  output: string;
  state: RepoState;
}

export type GoalCheck =
  | { type: "head"; branch: string; label: string }
  | { type: "branchExists"; name: string; label: string }
  | { type: "contains"; branch: string; ref: string; label: string }
  | { type: "ahead"; branch: string; of: string; min: number; label: string }
  | { type: "sameCommit"; a: string; b: string; label: string }
  | { type: "at"; ref: string; commit: CommitId; label: string }
  | { type: "commitCount"; ref: string; min: number; label: string }
  | { type: "noMergeOn"; branch: string; label: string };

export interface GitLevel {
  id: string;
  title: string;
  topic: "commit" | "branch" | "merge" | "rebase" | "remotes" | "undo";
  lessonSlug: string;
  blurb: string;
  why: string;
  start: RepoState;
  /** Optional snapshot shown as the goal tree. */
  goalPreview: RepoState;
  checks: GoalCheck[];
  hint: string;
  solution: string[];
}

export interface GoalStatus {
  label: string;
  passed: boolean;
}
