import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import { FIRST_LESSON_HREF, PRACTICE_DIALECTS } from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Open the SQL lab — filters, NULLs, and LIMIT on a local sample. Not a live warehouse.",
};

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Practice · local lab"
        title="Your practice desk"
        description="Default is the Zero→Hero SQL lab. Dialect links open the same in-lesson editor — this page is the door, not an empty desk."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <section
        data-testid="practice-desk"
        className="panel rounded-3xl border-2 border-[var(--coral)]/35 p-6 sm:p-8"
      >
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
          SQL default
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-[var(--ink-fg)]">
          SELECT, filters, NULLs, and LIMIT
        </h2>
        <p className="mt-2 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">
          Run a real query against the Aurora sample in your browser. Local DuckDB — not a
          warehouse.
        </p>
        <Link href={FIRST_LESSON_HREF} className="btn-primary mt-5 inline-flex" data-testid="practice-open-lab">
          <FlaskConical className="h-4 w-4" aria-hidden />
          Open the SQL lab →
        </Link>
      </section>

      <section aria-labelledby="practice-dialects-heading">
        <h2
          id="practice-dialects-heading"
          className="font-display text-lg font-bold text-[var(--ink-fg)]"
        >
          Dialects
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Same local engines. Pick a flavor — each link is a real lesson, not a placeholder.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2" data-testid="practice-dialect-tabs">
          {PRACTICE_DIALECTS.map((d) => (
            <li key={d.id}>
              <Link
                href={d.href}
                className="inline-flex rounded-full border border-[var(--ink-border)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--ink-fg)] hover:border-[var(--coral)]/50"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
