import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import { PlacementDiagnostic } from "@/components/paths/PlacementDiagnostic";
import { GitSkillPathCard, PathsHubOutline } from "@/components/paths/ZeroToHeroOutline";
import { ZERO_TO_HERO_HREF } from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "Paths",
  description: "Zero→Hero DE outline — existing lessons only. Skip ahead with six placement questions.",
};

export default function PathsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Paths · Zero→Hero"
        title="One school, two doors"
        description="Start at the first SELECT, or skip ahead with six short questions. Cert-style order is not the default spine."
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
            L0 fundamentals through interview-shaped existing lessons. Every node is a lesson that
            already exists.
          </p>
        </div>
        <span className="btn-primary shrink-0 self-start sm:self-center">
          <Compass className="h-4 w-4" aria-hidden />
          Open outline →
        </span>
      </Link>

      <PlacementDiagnostic />

      <PathsHubOutline />

      <GitSkillPathCard testId="paths-git-skill" />
    </div>
  );
}
