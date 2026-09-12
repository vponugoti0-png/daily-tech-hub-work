"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CERT_PATH, META_DE_OVERLAY, TRACKS } from "@/lib/tracks";
import { loadProgress, trackCompletion } from "@/lib/progress";
import { loginHref, signupHref } from "@/lib/safe-path";

const TRACK_SLUGS: Record<string, string[]> = {
  "prompt-engineering": [
    "pe-ask-better-questions",
    "pe-structure-prompts",
    "pe-iterate-and-refine",
    "pe-verify-answers",
    "pe-safety-privacy",
    "pe-prompts-for-learning",
    "pe-de-role-prompt-library",
  ],
  "ai-data-eng": [
    "ai-de-copilot-mindset",
    "ai-de-debug-with-ai",
    "ai-de-generate-code-safely",
    "ai-de-docs-and-tests",
    "ai-de-tools-workflow",
    "ai-de-review-changes",
    "ai-de-practice-agents",
    "ai-de-practice-nonsf-agents",
  ],
  python: [
    "python-dataframe-contracts",
    "python-typing-for-pipelines",
    "python-testing-spark-logic",
    "python-idempotent-writers",
    "python-config-and-secrets",
    "python-orchestration-hooks",
    "python-performance-de",
    "python-packaging-de-libs",
    "python-capstone-cli-package",
    "python-etl-pipeline-builder",
  ],
  sql: [
    "sql-select-filter-nulls",
    "sql-dml-write-path",
    "sql-aggregates-group-having",
    "sql-patterns-aliases-case",
    "sql-exists-any-all",
    "sql-ddl-constraints",
    "sql-dates-injection",
    "sql-joins-set-logic-recap",
    "sql-window-functions-de",
    "sql-incremental-loads",
    "sql-performance-basics",
    "sql-dimensional-modeling",
    "sql-data-quality",
    "sql-ctes-readability",
    "sql-semi-structured",
    "sql-deduping-late-data",
    "sql-shared-capstone-checklist",
    "sql-slowly-changing-dimensions",
    "sql-explain-plan-lab",
    "sql-staging-mart-etl",
  ],
  databricks: [
    "dbx-workspace-cluster-basics",
    "dbx-lakehouse-fundamentals",
    "dbx-delta-lake-basics",
    "dbx-spark-sql-performance",
    "dbx-unity-catalog",
    "dbx-jobs-workflows",
    "dbx-structured-streaming",
    "dbx-sql-warehouses",
    "dbx-autoloader-ingestion",
    "dbx-capstone-medallion-job",
    "dbx-dlt-pipelines",
    "dbx-liquid-clustering",
    "dbx-medallion-etl-builder",
  ],
  snowflake: [
    "sf-day0-objects",
    "sf-architecture",
    "sf-time-travel-clones",
    "sf-streams-tasks",
    "sf-dynamic-tables",
    "sf-performance-cost",
    "sf-governance-rbac",
    "sf-snowpark-python",
    "sf-copy-stages-ingestion",
    "sf-capstone-dynamic-table-mart",
    "sf-zero-copy-clone-dev",
    "sf-cortex-vs-snowpark",
    "sf-warehouse-etl-builder",
  ],
  "forward-deployed": [
    "fde-what-an-fde-is",
    "fde-discovery-shadowing",
    "fde-smallest-valuable-deploy",
    "fde-integrate-customer-env",
    "fde-deploy-environments",
    "fde-security-review",
    "fde-observability-handoff",
    "fde-ai-rag-evals",
    "fde-stakeholder-demos",
    "fde-capstone-engagement",
  ],
  git: [
    "git-rebase-vs-merge",
    "git-commit-hygiene",
    "git-bisect-and-blame",
    "git-branching-dbt-sql",
    "git-pr-templates-data-diffs",
  ],
};

const TRACK_HUE: Record<string, string> = {
  "prompt-engineering": "var(--violet)",
  "ai-data-eng": "var(--coral)",
  python: "var(--sun)",
  sql: "var(--mint)",
  databricks: "var(--coral)",
  snowflake: "var(--sky)",
  "forward-deployed": "var(--mint)",
  git: "var(--muted)",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("dth-progress", on);
    return () => window.removeEventListener("dth-progress", on);
  }, []);

  const rows = useMemo(() => {
    void tick;
    void loadProgress();
    return CERT_PATH.map((id) => {
      const meta = TRACKS.find((t) => t.id === id)!;
      const slugs = TRACK_SLUGS[id] || [];
      const c = trackCompletion(id, slugs);
      return { meta, ...c };
    });
  }, [tick, user]);

  const overall = useMemo(() => {
    const done = rows.reduce((a, r) => a + r.done, 0);
    const total = rows.reduce((a, r) => a + r.total, 0);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [rows]);

  const hasLocalProgress = overall.done > 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-[var(--muted)]">Loading session…</p>
      </div>
    );
  }

  // Guests may browse /dashboard (local progress only). Sign-in is optional
  // sync — not a hard gate. Login/signup keep callbackUrl=/dashboard.
  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Free learning progress · 100% free
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink-fg)]">
            Your progress
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Lessons you complete are saved on this device. There are no paid plans — a free
            account only syncs your training across devices.
          </p>
          <p className="mt-3 max-w-2xl text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--sky)]">{META_DE_OVERLAY.eyebrow}.</span>{" "}
            {META_DE_OVERLAY.blurb}
          </p>
        </div>

        <div className="panel rounded-3xl p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[var(--sun)]">
                On this device
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-[var(--ink-fg)]">
                {overall.pct}%
              </p>
              <p className="text-sm text-[var(--muted)]">
                {hasLocalProgress
                  ? `${overall.done}/${overall.total} lessons complete locally`
                  : `0/${overall.total} lessons complete locally — pick a free track to start`}
              </p>
            </div>
            <Link href="/training" className="btn-primary">
              {hasLocalProgress ? "Continue training" : "Start free training"}
            </Link>
          </div>
          <div className="progress-track mt-4">
            <div
              className={`progress-fill ${overall.pct === 100 ? "done" : ""}`}
              style={{ width: `${overall.pct}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(({ meta, done, total, pct }) => (
            <Link
              key={meta.id}
              href={`/training/${meta.id}`}
              className="panel glass-hover rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[var(--ink-fg)]">
                  {meta.title}
                </h2>
                <span className="text-sm font-bold" style={{ color: TRACK_HUE[meta.id] }}>
                  {pct}%
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{meta.blurb}</p>
              <div className="progress-track mt-4">
                <div
                  className={`progress-fill ${pct === 100 ? "done" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {done}/{total} lessons · free track
              </p>
            </Link>
          ))}
        </div>

        <div className="panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-[var(--ink-fg)]">
              Save this progress across devices
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Sign in or create a free account to sync. Still 100% free — no premium tiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={loginHref("/dashboard")} className="btn-ghost">
              Sign in
            </Link>
            <Link href={signupHref("/dashboard")} className="btn-ghost">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          My progress · 100% free
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink-fg)]">My progress</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Free learning progress across your tracks — coral = go, mint = done, sun = reward. No paid
          plans.
        </p>
        <p className="mt-3 max-w-2xl text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--sky)]">{META_DE_OVERLAY.eyebrow}.</span>{" "}
          {META_DE_OVERLAY.blurb}
        </p>
      </div>

      <p className="text-sm text-[var(--ink-fg)]">
        Signed in as <strong>{user.name}</strong> ({user.email}) — progress syncs to your free
        account.
      </p>

      <div className="panel rounded-3xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[var(--sun)]">
              Overall learning progress
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-[var(--ink-fg)]">{overall.pct}%</p>
            <p className="text-sm text-[var(--muted)]">
              {overall.done}/{overall.total} lessons complete
            </p>
          </div>
          <Link href="/training" className="btn-primary">
            Continue training
          </Link>
        </div>
        <div className="progress-track mt-4">
          <div
            className={`progress-fill ${overall.pct === 100 ? "done" : ""}`}
            style={{ width: `${overall.pct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ meta, done, total, pct }) => (
          <Link key={meta.id} href={`/training/${meta.id}`} className="panel glass-hover rounded-2xl p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[var(--ink-fg)]">{meta.title}</h2>
              <span className="text-sm font-bold" style={{ color: TRACK_HUE[meta.id] }}>
                {pct}%
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{meta.blurb}</p>
            <div className="progress-track mt-4">
              <div
                className={`progress-fill ${pct === 100 ? "done" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {done}/{total} lessons · free track
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
