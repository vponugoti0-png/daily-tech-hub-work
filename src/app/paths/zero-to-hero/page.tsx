import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { JargonChips } from "@/components/JargonTip";
import { GitSkillPathCard, ZeroToHeroDetailOutline } from "@/components/paths/ZeroToHeroOutline";
import { FIRST_LESSON_HREF } from "@/lib/learner-paths";

export const metadata: Metadata = {
  title: "Zero→Hero DE",
  description: "Zero→Hero outline — L0–L7 linking to existing training slugs.",
};

export default function ZeroToHeroPage() {
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
        description="Existing lessons only. Prompt Engineering, AI for DE, and FDE stay electives. Git is a skill path."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={FIRST_LESSON_HREF} className="btn-primary inline-flex" data-testid="z2h-start">
          Start L1 in the SQL lab →
        </Link>
        <Link href="/paths#placement" className="btn-ghost inline-flex" data-testid="z2h-placement">
          Skip ahead with six questions →
        </Link>
      </div>

      <ZeroToHeroDetailOutline />

      <GitSkillPathCard testId="z2h-git-skill" />
    </div>
  );
}
