import {
  cloneRepo,
  commitsAhead,
  emptyRepo,
  headCommit,
  isAncestor,
  placeCommit,
  type GitRepo,
} from "./engine";

export type GitSkill =
  | "commit"
  | "branch"
  | "merge"
  | "rebase"
  | "relative-refs"
  | "cherry-pick"
  | "remotes";

export interface GitLevel {
  id: string;
  title: string;
  skill: GitSkill;
  story: string;
  goal: string;
  hint: string;
  suggested: string[];
  lessonSlugs: string[];
  setup: () => GitRepo;
  check: (repo: GitRepo) => boolean;
}

function repoWithMain(messages: string[]): GitRepo {
  const repo = emptyRepo();
  for (const message of messages) {
    const parents = Object.keys(repo.commits).length ? [headCommit(repo)] : [];
    placeCommit(repo, message, parents);
  }
  return repo;
}

function branchAt(repo: GitRepo, name: string, start: string) {
  repo.branches[name] = start;
}

const ALL_LESSONS = [
  "git-rebase-vs-merge",
  "git-commit-hygiene",
  "git-bisect-and-blame",
  "git-branching-dbt-sql",
  "git-pr-templates-data-diffs",
];

export const GIT_LEVELS: GitLevel[] = [
  {
    id: "atomic-commit",
    title: "1 · Atomic commit",
    skill: "commit",
    story:
      "Aurora marts just got a unique_key='order_id' contract. Land it as a real SHA so the warehouse audit can point at a commit — not 'update stuff'.",
    goal: "Make one commit on main (git commit). Stay on main.",
    hint: "git commit -m \"feat(marts): pin orders unique_key=order_id\"",
    suggested: ['git commit -m "feat(marts): pin orders unique_key=order_id"'],
    lessonSlugs: ["git-commit-hygiene", ...ALL_LESSONS],
    setup: () => repoWithMain(["chore: init aurora marts"]),
    check: (repo) => {
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "main") return false;
      const main = repo.branches.main;
      return Boolean(main && repo.commits[main]?.parents.length === 1);
    },
  },
  {
    id: "story-branch",
    title: "2 · Story branch",
    skill: "branch",
    story:
      "One dbt story per branch. Name the grain — feat/orders-daily-late-events — not feat/everything-q3. Silver MERGE and gold grain travel together.",
    goal: "Create feat/orders-daily-late-events from main and commit once on it.",
    hint: "git checkout -b feat/orders-daily-late-events  then  git commit -m \"feat(gold): late-event overlap on orders_daily\"",
    suggested: [
      "git checkout -b feat/orders-daily-late-events",
      'git commit -m "feat(gold): late-event overlap on orders_daily"',
    ],
    lessonSlugs: ["git-branching-dbt-sql", "git-commit-hygiene", ...ALL_LESSONS],
    setup: () =>
      repoWithMain(["chore: init aurora marts", "feat(silver): orders MERGE at order_id"]),
    check: (repo) => {
      const feat = repo.branches["feat/orders-daily-late-events"];
      const main = repo.branches.main;
      if (!feat || !main) return false;
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "feat/orders-daily-late-events") {
        return false;
      }
      return commitsAhead(repo, feat, main).length === 1 && isAncestor(repo, main, feat);
    },
  },
  {
    id: "merge-shared",
    title: "3 · Merge shared history",
    skill: "merge",
    story:
      "Shared analytics release branch. Teammates already pushed docs on main. Merge the mart slice — do not rebase people who already fetched this history.",
    goal: "On main, merge feat/orders so both the model and the docs commits are ancestors.",
    hint: "Stay on main, then git merge feat/orders",
    suggested: ["git merge feat/orders"],
    lessonSlugs: ["git-rebase-vs-merge", "git-pr-templates-data-diffs", ...ALL_LESSONS],
    setup: () => {
      const repo = repoWithMain(["chore: init aurora marts", "feat(silver): orders MERGE at order_id"]);
      const base = repo.branches.main;
      branchAt(repo, "feat/orders", base);
      repo.HEAD = { kind: "branch", name: "feat/orders" };
      placeCommit(repo, "feat(gold): orders_daily late-event window", [base]);
      repo.HEAD = { kind: "branch", name: "main" };
      placeCommit(repo, "docs: PR template grain + row-count checkboxes", [base]);
      return repo;
    },
    check: (repo) => {
      const main = repo.branches.main;
      const feat = repo.branches["feat/orders"];
      if (!main || !feat) return false;
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "main") return false;
      const merge = repo.commits[main];
      if (!merge || merge.parents.length !== 2) return false;
      return isAncestor(repo, feat, main) && merge.parents.includes(feat);
    },
  },
  {
    id: "rebase-personal",
    title: "4 · Rebase hygiene",
    skill: "rebase",
    story:
      "Personal branch only. Silver MERGE already landed on main. Rebase your gold late-events commit so the dbt PR is linear — never rebase the shared release.",
    goal: "Rebase feat/orders-daily onto main. Feature stays 1 commit ahead; main does not move.",
    hint: "You are already on feat/orders-daily. Run git rebase main",
    suggested: ["git rebase main"],
    lessonSlugs: ["git-rebase-vs-merge", ...ALL_LESSONS],
    setup: () => {
      const repo = repoWithMain(["chore: init aurora marts", "feat(silver): orders MERGE at order_id"]);
      const base = repo.branches.main;
      branchAt(repo, "feat/orders-daily", base);
      repo.HEAD = { kind: "branch", name: "feat/orders-daily" };
      placeCommit(repo, "feat(gold): late-arriving orders for last 2 days", [base]);
      repo.HEAD = { kind: "branch", name: "main" };
      placeCommit(repo, "feat(silver): teammate MERGE already on main", [base]);
      repo.HEAD = { kind: "branch", name: "feat/orders-daily" };
      return repo;
    },
    check: (repo) => {
      const main = repo.branches.main;
      const feat = repo.branches["feat/orders-daily"];
      if (!main || !feat) return false;
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "feat/orders-daily") return false;
      if ((repo.commits[main]?.message ?? "").indexOf("teammate MERGE") < 0) return false;
      if ((repo.commits[feat]?.parents.length ?? 0) !== 1) return false;
      return isAncestor(repo, main, feat) && commitsAhead(repo, feat, main).length === 1;
    },
  },
  {
    id: "relative-undo",
    title: "5 · Relative refs",
    skill: "relative-refs",
    story:
      "You staged a Snowflake key pair in .env. History is not a vault — drop the last commit with HEAD~ before anyone fetches it. Then rotate the key for real.",
    goal: "Reset main to HEAD~1 (or HEAD^) so the bad .env commit is no longer the tip.",
    hint: "git reset --hard HEAD~1   (HEAD^ also works)",
    suggested: ["git reset --hard HEAD~1"],
    lessonSlugs: ["git-commit-hygiene", "git-bisect-and-blame", ...ALL_LESSONS],
    setup: () =>
      repoWithMain([
        "chore: init aurora marts",
        "feat(silver): orders MERGE at order_id",
        "feat(gold): orders_daily grain",
        "chore: add .env with warehouse key (bad)",
      ]),
    check: (repo) => {
      const main = repo.branches.main;
      if (!main || repo.HEAD.kind !== "branch" || repo.HEAD.name !== "main") return false;
      const tip = repo.commits[main];
      return Boolean(tip && !/env/i.test(tip.message) && /grain/i.test(tip.message));
    },
  },
  {
    id: "cherry-pick-hotfix",
    title: "6 · Cherry-pick hotfix",
    skill: "cherry-pick",
    story:
      "Bisect found the grain break: unique_key vanished from orders.sql. Cherry-pick the hotfix onto main. Leave the SCD2 customers branch alone — that PR is a different story.",
    goal: "On main, cherry-pick the hotfix/grain commit (or C2). feat/scd2 must stay put.",
    hint: "git cherry-pick hotfix/grain   or   git cherry-pick C2",
    suggested: ["git cherry-pick hotfix/grain"],
    lessonSlugs: ["git-bisect-and-blame", ...ALL_LESSONS],
    setup: () => {
      const repo = repoWithMain(["chore: init aurora marts", "feat(silver): orders MERGE at order_id"]);
      const base = repo.branches.main;
      branchAt(repo, "hotfix/grain", base);
      repo.HEAD = { kind: "branch", name: "hotfix/grain" };
      placeCommit(repo, "fix(silver): restore unique_key=order_id", [base]);
      repo.HEAD = { kind: "branch", name: "main" };
      branchAt(repo, "feat/scd2", base);
      repo.HEAD = { kind: "branch", name: "feat/scd2" };
      placeCommit(repo, "feat(dim): customers SCD2 effective dates", [base]);
      repo.HEAD = { kind: "branch", name: "main" };
      return repo;
    },
    check: (repo) => {
      const main = repo.branches.main;
      const hotfix = repo.branches["hotfix/grain"];
      const scd = repo.branches["feat/scd2"];
      if (!main || !hotfix || !scd) return false;
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "main") return false;
      if (repo.commits[scd]?.message.indexOf("SCD2") < 0) return false;
      const tip = repo.commits[main];
      return Boolean(
        tip &&
          tip.parents.length === 1 &&
          /unique_key=order_id/.test(tip.message) &&
          tip.id !== hotfix,
      );
    },
  },
  {
    id: "fetch-rebase-origin",
    title: "7 · Remotes basics",
    skill: "remotes",
    story:
      "No GitHub from this tab. A teammate already landed the silver MERGE on the simulated origin. Fetch it, then rebase your gold branch so the data-diff PR starts from current main.",
    goal: "Fetch origin, then rebase feat/orders-daily onto origin/main. Stay one commit ahead.",
    hint: "git fetch origin   then   git rebase origin/main",
    suggested: ["git fetch origin", "git rebase origin/main"],
    lessonSlugs: ["git-pr-templates-data-diffs", "git-branching-dbt-sql", ...ALL_LESSONS],
    setup: () => {
      const repo = repoWithMain(["chore: init aurora marts", "feat(silver): orders MERGE at order_id"]);
      const stale = repo.branches.main;
      repo.HEAD = { kind: "branch", name: "main" };
      const serverTip = placeCommit(repo, "feat(silver): teammate MERGE on origin/main", [stale]);
      repo.server.origin = { main: serverTip };
      repo.remotes.origin = { main: stale };
      repo.branches.main = stale;
      branchAt(repo, "feat/orders-daily", stale);
      repo.HEAD = { kind: "branch", name: "feat/orders-daily" };
      placeCommit(repo, "feat(gold): orders_daily late overlap + row-count note", [stale]);
      return repo;
    },
    check: (repo) => {
      const originMain = repo.remotes.origin?.main;
      const serverMain = repo.server.origin?.main;
      const feat = repo.branches["feat/orders-daily"];
      if (!originMain || !serverMain || !feat) return false;
      if (originMain !== serverMain) return false;
      if (repo.HEAD.kind !== "branch" || repo.HEAD.name !== "feat/orders-daily") return false;
      if ((repo.commits[feat]?.parents.length ?? 0) !== 1) return false;
      return isAncestor(repo, originMain, feat) && commitsAhead(repo, feat, originMain).length === 1;
    },
  },
];

const DEFAULT_BY_LESSON: Record<string, string> = {
  "git-rebase-vs-merge": "rebase-personal",
  "git-commit-hygiene": "atomic-commit",
  "git-bisect-and-blame": "cherry-pick-hotfix",
  "git-branching-dbt-sql": "story-branch",
  "git-pr-templates-data-diffs": "fetch-rebase-origin",
};

export function defaultLevelId(slug: string): string {
  return DEFAULT_BY_LESSON[slug] ?? GIT_LEVELS[0].id;
}

export function getLevel(id: string): GitLevel | undefined {
  return GIT_LEVELS.find((level) => level.id === id);
}

export function startLevel(id: string): GitRepo {
  const level = getLevel(id) ?? GIT_LEVELS[0];
  return cloneRepo(level.setup());
}
