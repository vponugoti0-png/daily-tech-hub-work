"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import {
  GIT_SKILL_PATH,
  pathNodeHref,
  ZERO_TO_HERO_LEVELS,
} from "@/lib/learner-paths";
import { usePlacementLanding } from "@/components/paths/PlacementDiagnostic";
import { cn } from "@/lib/utils";

export function PathsHubOutline() {
  const landing = usePlacementLanding();

  return (
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
              data-testid={`paths-level-${level.id}`}
              className={cn(
                "panel glass-hover block rounded-2xl p-4",
                landing === level.id && "border-2 border-[var(--mint)]/50",
              )}
            >
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                {level.id} · {level.name}
                {landing === level.id ? " · suggested" : ""}
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
  );
}

export function ZeroToHeroDetailOutline() {
  const landing = usePlacementLanding();

  return (
    <ol className="space-y-4" data-testid="z2h-outline">
      {ZERO_TO_HERO_LEVELS.map((level) => (
        <li
          key={level.id}
          data-testid={`z2h-level-${level.id}`}
          className={cn(
            "panel rounded-3xl p-5",
            landing === level.id && "border-2 border-[var(--mint)]/50",
          )}
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
            {level.id}
            {landing === level.id ? " · suggested" : ""}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">{level.name}</h2>
          <p className="mt-1 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">{level.blurb}</p>
          <Link href={level.href} className="mt-3 inline-block text-sm font-bold text-[var(--coral)]">
            {level.hrefLabel} →
          </Link>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {level.nodes.map((node) => (
              <li key={`${node.track}:${node.slug}:${node.title}`}>
                <Link
                  href={pathNodeHref(node)}
                  className="block rounded-xl border border-[var(--ink-border)] px-3 py-2 text-sm text-[var(--ink-fg)] hover:border-[var(--coral)]/40"
                >
                  {node.title}
                  {node.elective ? (
                    <span
                      className="ml-2 rounded-full bg-[var(--sun)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sun)]"
                      data-testid={
                        node.track === "forward-deployed" ? "z2h-fde-elective" : undefined
                      }
                    >
                      {node.track === "forward-deployed" ? "L6 Elective" : "Elective"}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function GitSkillPathCard({ testId }: { testId: string }) {
  return (
    <section data-testid={testId} className="panel rounded-3xl p-5">
      <p className="flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        <GitBranch className="h-3.5 w-3.5" aria-hidden />
        Skill path
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">{GIT_SKILL_PATH.name}</h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{GIT_SKILL_PATH.blurb}</p>
      <Link
        href={GIT_SKILL_PATH.href}
        className="mt-3 inline-block text-sm font-bold text-[var(--coral)]"
      >
        {GIT_SKILL_PATH.hrefLabel} →
      </Link>
    </section>
  );
}
