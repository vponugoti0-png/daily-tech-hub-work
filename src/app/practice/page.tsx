import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import { LocalPracticeLab } from "@/components/training/LocalPracticeLab";
import { getLesson } from "@/lib/content";
import {
  FIRST_LESSON_HREF,
  PRACTICE_DIALECTS,
  practiceDeskForDialect,
} from "@/lib/learner-paths";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Open the SQL lab — filters, NULLs, and LIMIT on a local sample. Not a live warehouse.",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ dialect?: string }>;
}) {
  const { dialect } = await searchParams;
  const desk = practiceDeskForDialect(dialect);
  const lesson = getLesson(desk.track, desk.slug);
  const task =
    lesson?.objectives[0] ??
    "Return paid aurora_orders newest first — then change a WHERE and hit Run.";

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Practice · local lab"
        title="Your practice desk"
        description="Default is the Zero→Hero SQL lab. Dialect tabs switch this same editor — not an empty desk."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <section aria-labelledby="practice-dialects-heading">
        <h2
          id="practice-dialects-heading"
          className="font-display text-lg font-bold text-[var(--ink-fg)]"
        >
          Dialects
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Same local engines. Pick a flavor — each tab is a real lesson sample, not a placeholder.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2" data-testid="practice-dialect-tabs">
          {PRACTICE_DIALECTS.map((d) => {
            const active = d.id === desk.id;
            return (
              <li key={d.id}>
                <Link
                  href={d.href}
                  aria-current={active ? "page" : undefined}
                  data-dialect={d.id}
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1.5 font-mono text-sm font-semibold",
                    active
                      ? "border-[var(--coral)]/50 bg-[var(--coral)]/15 text-[var(--ink-fg)]"
                      : "border-[var(--ink-border)] bg-[var(--panel)] text-[var(--ink-fg)] hover:border-[var(--coral)]/50",
                  )}
                >
                  {d.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="practice-tryit-shell" data-testid="practice-tryit-shell">
        <section
          data-testid="practice-desk"
          className="panel rounded-3xl border-2 border-[var(--coral)]/35 p-6 sm:p-8"
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            {desk.id} default
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[var(--ink-fg)]">
            {lesson?.title ?? "SELECT, filters, NULLs, and LIMIT"}
          </h2>
          <p className="mt-2 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">
            {lesson?.description ??
              "Run a real query against the Aurora sample in your browser. Local DuckDB — not a warehouse."}
          </p>
          <p className="mt-4 text-sm text-[var(--ink-fg)]">
            <span className="font-semibold">Task: </span>
            {task}
          </p>
          <Link
            href={desk.lessonHref}
            className="btn-primary mt-5 inline-flex"
            data-testid="practice-open-lab"
          >
            <FlaskConical className="h-4 w-4" aria-hidden />
            Open the full lesson →
          </Link>
        </section>

        <LocalPracticeLab key={`${desk.track}:${desk.slug}`} track={desk.track} slug={desk.slug} />
      </div>

      <p className="text-xs text-[var(--muted)]">
        Same editor as the lesson <code className="font-mono">#lab</code>. Guest Run still writes{" "}
        <code className="font-mono">stepIndex</code> only.
        {desk.id === "sql" ? null : (
          <>
            {" "}
            Prefer the SQL door?{" "}
            <Link href={FIRST_LESSON_HREF} className="font-semibold text-[var(--ink-fg)] underline">
              Open sql-select-filter-nulls
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
