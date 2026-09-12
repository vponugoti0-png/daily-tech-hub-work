"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Trophy } from "lucide-react";
import {
  L1_FINISH_HREF,
  L1_SQL_SPINE,
  L2_PYTHON_HREF,
  isL1Mastered,
  remainingL1Slugs,
} from "@/lib/learner-paths";
import {
  DIRTY_ORDERS_README,
  DIRTY_ORDERS_SNIPPET,
  L1_TROPHY_METRICS,
  completedSlugIds,
  downloadTextFile,
  transferSentence,
} from "@/lib/l1-trophy";
import { loadProgress } from "@/lib/progress";
import { DownloadTranscript } from "@/components/training/DownloadTranscript";
import { CopyButton } from "@/components/CopyButton";

function useGuestLessons() {
  const [lessons, setLessons] = useState<ReturnType<typeof loadProgress>["lessons"]>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setLessons(loadProgress().lessons);
      setReady(true);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, []);

  return { lessons, ready };
}

export function L1FinishScreen() {
  const { lessons, ready } = useGuestLessons();
  const mastered = isL1Mastered(lessons);
  const leftover = remainingL1Slugs(lessons);
  const sentence = useMemo(
    () => transferSentence(completedSlugIds(lessons)),
    [lessons],
  );

  if (!ready) {
    return (
      <div data-testid="l1-finish" className="space-y-6">
        <p className="text-sm text-[var(--muted)]">Reading progress on this device…</p>
      </div>
    );
  }

  if (!mastered) {
    return (
      <div data-testid="l1-finish" className="space-y-6">
        <header>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            L1 SQL loop
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink-fg)]">
            Finish the eight SQL checkpoints
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            The trophy screen opens after every L1 slug is marked complete on this device. No
            account required.
          </p>
        </header>
        <p data-testid="transfer-sentence" className="max-w-2xl text-base text-[var(--ink-fg)]">
          {sentence}
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {leftover.map((slug) => {
            const step = L1_SQL_SPINE.find((s) => s.slug === slug);
            return (
              <li key={slug}>
                <Link
                  href={`/training/sql/${slug}#lab`}
                  className="panel glass-hover block rounded-2xl p-4"
                  data-testid={`l1-remaining-${slug}`}
                >
                  <p className="font-display text-sm font-bold text-[var(--ink-fg)]">
                    {step?.title ?? slug}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--muted)]">{slug}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <DownloadTranscript />
      </div>
    );
  }

  return (
    <div data-testid="l1-finish" className="space-y-8">
      <header className="panel rounded-3xl border-2 border-[var(--mint)]/35 p-6">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--sun)]">
          <Trophy className="h-4 w-4" aria-hidden />
          First trophy
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--ink-fg)] sm:text-4xl">
          L1 SQL is complete
        </h1>
        <p
          data-testid="transfer-sentence"
          className="mt-3 max-w-2xl text-lg text-[var(--ink-fg)]"
        >
          {sentence}
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          This is a local milestone from guest progress — not a server-issued record.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={L2_PYTHON_HREF} className="btn-primary inline-flex" data-testid="l1-finish-next">
            Continue to L2 Python →
          </Link>
          <Link href="/practice" className="btn-ghost inline-flex" data-testid="l1-finish-practice">
            Run it on the practice desk
          </Link>
        </div>
      </header>

      <section
        data-testid="l1-exercise"
        className="space-y-4"
        aria-labelledby="l1-exercise-heading"
      >
        <h2 id="l1-exercise-heading" className="font-display text-xl font-bold text-[var(--ink-fg)]">
          Dirty orders → daily revenue
        </h2>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Filter dirty <code className="font-mono">aurora_orders</code> statuses, then aggregate
          paid amount by day. Same grain as the shared Aurora mart story. Seed-honest — local
          DuckDB, not a warehouse.
        </p>

        <div
          data-testid="l1-metrics"
          className="grid gap-3 sm:grid-cols-2"
        >
          {L1_TROPHY_METRICS.map((metric) => (
            <article
              key={metric.id}
              data-testid={`l1-metric-${metric.id}`}
              className="panel rounded-2xl p-4"
            >
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                {metric.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[var(--ink-fg)]">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">{metric.hint}</p>
            </article>
          ))}
        </div>

        <div data-testid="l1-readme" className="panel rounded-2xl p-4">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--violet)]">
            Three-line README
          </p>
          <pre className="mt-3 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--ink-fg)]">
            {DIRTY_ORDERS_README}
          </pre>
        </div>

        <div data-testid="l1-snippet" className="panel rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--coral)]">
              Downloadable snippet
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyButton
                text={DIRTY_ORDERS_SNIPPET}
                label="Copy SQL"
                className="border-[var(--ink-border)] bg-[var(--panel)] text-[var(--ink-fg)] hover:border-[var(--coral)]/40 hover:text-[var(--ink-fg)]"
              />
              <button
                type="button"
                className="btn-ghost inline-flex min-h-[40px] text-xs"
                data-testid="l1-snippet-download"
                onClick={() =>
                  downloadTextFile(
                    "aurora-dirty-orders-daily-revenue.sql",
                    `${DIRTY_ORDERS_SNIPPET}\n`,
                    "text/sql",
                  )
                }
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download SQL
              </button>
            </div>
          </div>
          <pre className="mt-3 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--ink-fg)]">
            {DIRTY_ORDERS_SNIPPET}
          </pre>
        </div>
      </section>

      <DownloadTranscript heading="Download your transcript" />

      <p className="text-xs text-[var(--muted)]">
        Bookmark <code className="font-mono">{L1_FINISH_HREF}</code> — it rereads guest progress
        only.
      </p>
    </div>
  );
}
