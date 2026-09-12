import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import {
  FIRST_LESSON_HREF,
  ZERO_TO_HERO_HREF,
  ZERO_TO_HERO_LEVELS,
} from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "Paths",
  description: "Zero→Hero DE outline — existing lessons only. Skip ahead to a later level.",
};

export default function PathsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Paths · Zero→Hero"
        title="One school, two doors"
        description="Start at the first SELECT, or jump a level if you already know the work. Cert-style order is not the default spine."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <Link
        href={ZERO_TO_HERO_HREF}
        data-testid="paths-zero-to-hero"
        className="panel glass-hover flex flex-col gap-3 rounded-3xl border-2 border-[var(--mint)]/35 p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--mint)]">
            Default path
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[var(--ink-fg)]">
            Zero→Hero DE
          </h2>
          <p className="mt-1 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">
            L0 fundamentals through a shipped mart. Every node is a lesson that already exists.
          </p>
        </div>
        <span className="btn-primary shrink-0 self-start sm:self-center">
          <Compass className="h-4 w-4" aria-hidden />
          Open outline →
        </span>
      </Link>

      <section aria-labelledby="paths-levels-heading" data-testid="paths-outline">
        <h2
          id="paths-levels-heading"
          className="font-display text-xl font-bold text-[var(--ink-fg)]"
        >
          Levels
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {ZERO_TO_HERO_LEVELS.map((level) => (
            <li key={level.id}>
              <Link
                href={level.href}
                className="panel glass-hover block rounded-2xl p-4"
              >
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                  {level.id} · {level.name}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{level.blurb}</p>
                <span className="mt-3 block text-xs font-bold text-[var(--coral)]">
                  {level.hrefLabel} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel rounded-3xl p-5">
        <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sun)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Skip ahead
        </p>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Know SQL already? Open a later level on this page, or start the lab anyway and skip
          what you have finished. Placement questions ship in a later ticket — this outline is
          the door.
        </p>
        <Link href={FIRST_LESSON_HREF} className="btn-ghost mt-4 inline-flex">
          Or start at the SQL lab →
        </Link>
      </section>
    </div>
  );
}
