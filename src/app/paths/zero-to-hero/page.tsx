import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import { FIRST_LESSON_HREF, ZERO_TO_HERO_LEVELS, ZERO_TO_HERO_SPINE } from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "Zero→Hero DE",
  description: "Zero→Hero outline — L0–L6 linking to existing training slugs.",
};

export default function ZeroToHeroPage() {
  const l1 = ZERO_TO_HERO_SPINE.filter((s) => s.level === "L1");

  return (
    <div className="space-y-8">
      <Link
        href="/paths"
        className="inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
      >
        <ArrowLeft className="h-4 w-4" /> All paths
      </Link>

      <SectionHeader
        eyebrow="Zero→Hero DE"
        title="From first SELECT to a shipped mart"
        description="Existing lessons only. Prompt Engineering, AI for DE, and FDE stay electives."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <Link href={FIRST_LESSON_HREF} className="btn-primary inline-flex" data-testid="z2h-start">
        Start L1 in the SQL lab →
      </Link>

      <ol className="space-y-4" data-testid="z2h-outline">
        {ZERO_TO_HERO_LEVELS.map((level) => (
          <li key={level.id} className="panel rounded-3xl p-5">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
              {level.id}
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
              {level.name}
            </h2>
            <p className="mt-1 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">{level.blurb}</p>
            <Link href={level.href} className="mt-3 inline-block text-sm font-bold text-[var(--coral)]">
              {level.hrefLabel} →
            </Link>
            {level.id === "L1" ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {l1.map((step) => (
                  <li key={step.slug}>
                    <Link
                      href={`/training/${step.track}/${step.slug}${step.lab ? "#lab" : ""}`}
                      className="block rounded-xl border border-[var(--ink-border)] px-3 py-2 text-sm text-[var(--ink-fg)] hover:border-[var(--coral)]/40"
                    >
                      {step.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
