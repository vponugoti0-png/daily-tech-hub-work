import { makeRepo } from "./engine";
import type { GitLevel } from "./types";

const C = (id: string, parents: string[], message: string) => ({ id, parents, message });

export const GIT_PLAY_LEVELS: GitLevel[] = [
  {
    id: "commit-mart",
    title: "Land a mart commit",
    topic: "commit",
    lessonSlug: "git-play-lab",
    blurb: "HEAD is on main at the dbt init. Add the orders_daily grain as a real commit.",
    why: "Analytics PRs start with an atomic commit reviewers can revert. This model has no staging area — `git commit` grows the tree.",
    start: makeRepo({
      commits: [C("C1", [], "chore: init dbt project")],
      branches: { main: "C1" },
      head: "main",
      remoteTracking: { "origin/main": "C1" },
      remoteRepo: { main: "C1" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(marts): add orders_daily grain"),
      ],
      branches: { main: "C2" },
      head: "main",
    }),
    checks: [
      { type: "head", branch: "main", label: "HEAD is on main" },
      { type: "commitCount", ref: "main", min: 2, label: "main has a new commit after init" },
    ],
    hint: "Stay on main and run git commit -m \"feat(marts): add orders_daily grain\"",
    solution: ['git commit -m "feat(marts): add orders_daily grain"'],
  },
  {
    id: "branch-dbt",
    title: "Branch a dbt model",
    topic: "branch",
    lessonSlug: "git-branching-dbt-sql",
    blurb: "Cut feat/orders-daily off main and land the late-events silver change there — not on main.",
    why: "Name the grain. Short-lived personal branches beat feat/everything-q3.",
    start: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
      ],
      branches: { main: "C2" },
      head: "main",
      remoteTracking: { "origin/main": "C2" },
      remoteRepo: { main: "C2" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "feat(marts): late events on orders_daily"),
      ],
      branches: { main: "C2", "feat/orders-daily": "C3" },
      head: "feat/orders-daily",
    }),
    checks: [
      { type: "branchExists", name: "feat/orders-daily", label: "feat/orders-daily exists" },
      { type: "head", branch: "feat/orders-daily", label: "HEAD is on feat/orders-daily" },
      { type: "ahead", branch: "feat/orders-daily", of: "main", min: 1, label: "feature is one commit ahead of main" },
    ],
    hint: "git checkout -b feat/orders-daily   then   git commit -m \"feat(marts): late events on orders_daily\"",
    solution: [
      "git checkout -b feat/orders-daily",
      'git commit -m "feat(marts): late events on orders_daily"',
    ],
  },
  {
    id: "merge-pr",
    title: "Merge the mart slice",
    topic: "merge",
    lessonSlug: "git-rebase-vs-merge",
    blurb: "feat/late-events is reviewable. Merge it into main the way a shared default branch should move.",
    why: "Shared long-lived branches merge. Personal branches rebase. Do not rewrite main.",
    start: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "feat(marts): late events window"),
      ],
      branches: { main: "C2", "feat/late-events": "C3" },
      head: "feat/late-events",
      remoteTracking: { "origin/main": "C2" },
      remoteRepo: { main: "C2" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "feat(marts): late events window"),
      ],
      branches: { main: "C3", "feat/late-events": "C3" },
      head: "main",
    }),
    checks: [
      { type: "head", branch: "main", label: "HEAD is on main" },
      { type: "contains", branch: "main", ref: "feat/late-events", label: "main contains the late-events tip" },
    ],
    hint: "git checkout main   then   git merge feat/late-events  (fast-forward is honest here)",
    solution: ["git checkout main", "git merge feat/late-events"],
  },
  {
    id: "rebase-hygiene",
    title: "Rebase a personal branch",
    topic: "rebase",
    lessonSlug: "git-rebase-vs-merge",
    blurb: "main moved while you were in feat/orders-daily. Replay your commit on top — do not merge main into the feature.",
    why: "Linear personal history keeps dbt/SQL PRs reviewable. Never rebase a shared release branch.",
    start: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "feat(marts): late events on orders_daily"),
        C("C4", ["C2"], "fix(tests): unique order_id"),
      ],
      branches: { main: "C4", "feat/orders-daily": "C3" },
      head: "feat/orders-daily",
      remoteTracking: { "origin/main": "C4" },
      remoteRepo: { main: "C4" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C4", ["C2"], "fix(tests): unique order_id"),
        C("C5", ["C4"], "feat(marts): late events on orders_daily"),
      ],
      branches: { main: "C4", "feat/orders-daily": "C5" },
      head: "feat/orders-daily",
    }),
    checks: [
      { type: "head", branch: "feat/orders-daily", label: "Stay on the personal branch" },
      { type: "contains", branch: "feat/orders-daily", ref: "main", label: "feature contains today's main" },
      { type: "ahead", branch: "feat/orders-daily", of: "main", min: 1, label: "your mart commit is still on top" },
      { type: "noMergeOn", branch: "feat/orders-daily", label: "no merge commit on the feature (rebase, don't merge main in)" },
    ],
    hint: "On feat/orders-daily run git rebase main  (or git rebase origin/main).",
    solution: ["git rebase main"],
  },
  {
    id: "remotes-fetch",
    title: "Fetch the mock remote",
    topic: "remotes",
    lessonSlug: "git-pr-templates-data-diffs",
    blurb: "A teammate landed unique_key tests on origin/main. Your local main is stale until you fetch and update.",
    why: "origin is a same-origin mock — no github.com. Fetch updates tracking refs; merge/rebase moves your branch.",
    start: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "test: assert unique order_id"),
      ],
      branches: { main: "C2" },
      head: "main",
      remoteTracking: { "origin/main": "C2" },
      remoteRepo: { main: "C3" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(silver): orders grain"),
        C("C3", ["C2"], "test: assert unique order_id"),
      ],
      branches: { main: "C3" },
      head: "main",
      remoteTracking: { "origin/main": "C3" },
      remoteRepo: { main: "C3" },
    }),
    checks: [
      { type: "head", branch: "main", label: "HEAD is on main" },
      { type: "sameCommit", a: "main", b: "origin/main", label: "main matches origin/main" },
      { type: "at", ref: "main", commit: "C3", label: "you picked up the uniqueness test commit" },
    ],
    hint: "git fetch   then   git merge origin/main   — or one shot: git pull",
    solution: ["git fetch", "git merge origin/main"],
  },
  {
    id: "undo-reset",
    title: "Undo a secret commit",
    topic: "undo",
    lessonSlug: "git-commit-hygiene",
    blurb: "C3 staged a .env. Move main back to C2 before anyone fetches it.",
    why: "reset --hard HEAD~1 drops the tip. Then rotate the credentials — gitignore will not rewrite history you already pushed.",
    start: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(marts): add orders_daily grain"),
        C("C3", ["C2"], "WIP: add .env with warehouse key"),
      ],
      branches: { main: "C3" },
      head: "main",
      remoteTracking: { "origin/main": "C2" },
      remoteRepo: { main: "C2" },
    }),
    goalPreview: makeRepo({
      commits: [
        C("C1", [], "chore: init dbt project"),
        C("C2", ["C1"], "feat(marts): add orders_daily grain"),
      ],
      branches: { main: "C2" },
      head: "main",
    }),
    checks: [
      { type: "head", branch: "main", label: "Stay on main" },
      { type: "at", ref: "main", commit: "C2", label: "main is back at the safe mart commit" },
    ],
    hint: "git reset --hard HEAD~1  (this model only moves the branch pointer)",
    solution: ["git reset --hard HEAD~1"],
  },
];

export function getGitLevel(id: string): GitLevel | undefined {
  return GIT_PLAY_LEVELS.find((l) => l.id === id);
}

export function levelsForLesson(slug: string): GitLevel[] {
  const pinned = GIT_PLAY_LEVELS.filter((l) => l.lessonSlug === slug);
  if (slug === "git-play-lab") return GIT_PLAY_LEVELS;
  if (slug === "git-rebase-vs-merge") {
    return GIT_PLAY_LEVELS.filter((l) => l.id === "rebase-hygiene" || l.id === "merge-pr");
  }
  if (slug === "git-bisect-and-blame") {
    return GIT_PLAY_LEVELS.filter((l) => l.id === "undo-reset" || l.id === "commit-mart");
  }
  if (pinned.length) return pinned;
  return GIT_PLAY_LEVELS;
}

export function defaultLevelId(slug: string): string {
  const list = levelsForLesson(slug);
  return list[0]?.id ?? GIT_PLAY_LEVELS[0].id;
}
