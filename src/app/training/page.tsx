import type { Metadata } from "next";
import Link from "next/link";
import { getAllLessons, getLessonsByTrack } from "@/lib/content";
import { SectionHeader } from "@/components/SectionHeader";
import { CORE_TRACKS, ELECTIVE_TRACKS } from "@/lib/tracks";
import { TrainingFilters } from "@/components/training/TrainingFilters";
import { JargonChips } from "@/components/JargonTip";
import { NextStepCard } from "@/components/NextStepCard";
import { FIRST_LESSON_HREF, ZERO_TO_HERO_HREF } from "@/lib/learner-paths";
import { Compass, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Zero→Hero DE path, quiet track catalog, and one Practice desk. Prompt Engineering, AI for DE, and FDE are electives.",
};

function TrackCard({
  track,
  elective,
}: {
  track: (typeof CORE_TRACKS)[number];
  elective?: boolean;
}) {
  const trackLessons = getLessonsByTrack(track.id);
  return (
    <Link
      href={`/training/${track.id}`}
      className="panel glass-hover rounded-3xl p-5"
    >
      <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${track.accent}`} />
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold text-[var(--ink-fg)]">{track.title}</h3>
        {elective ? (
          <span className="rounded-full bg-[var(--sun)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--sun)]">
            Elective
          </span>
        ) : track.badge ? (
          <span className="rounded-full bg-[var(--mint)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--mint)]">
            {track.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{track.blurb}</p>
      <p className="mt-4 text-xs text-[var(--muted)]">
        {track.pathLevel ?? "Track"} · {trackLessons.length} lessons · ~{track.estimatedHours}h
      </p>
    </Link>
  );
}

export default function TrainingPage() {
  const lessons = getAllLessons();
  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Learn · guest-friendly"
        title="Your school"
        description="Next step, one path, a quiet catalog. Practice is one button — not a stack of promos."
      />

      <div className="plain-english-panel">
        <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
          Plain English
        </p>
        <JargonChips />
      </div>

      <NextStepCard variant="learn" />

      <Link
        href={ZERO_TO_HERO_HREF}
        data-testid="learn-path-card"
        className="panel glass-hover flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sky)]">
            Path
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
            Zero→Hero DE
          </h2>
          <p className="mt-1 max-w-2xl line-clamp-2 text-sm text-[var(--muted)]">
            One spine from first SELECT to a shipped mart. Skip-ahead lives on Paths — not a
            second school.
          </p>
        </div>
        <span className="btn-ghost shrink-0 self-start sm:self-center">
          <Compass className="h-4 w-4" aria-hidden />
          Open path →
        </span>
      </Link>

      <div
        data-testid="training-practice-labs"
        className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--ink-border)] bg-[var(--panel)] px-5 py-4"
      >
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            Practice desk
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            One SQL default — dialect tabs live on Practice.
          </p>
        </div>
        <Link href={FIRST_LESSON_HREF} className="btn-primary" data-testid="open-practice">
          <FlaskConical className="h-4 w-4" aria-hidden />
          Open Practice
        </Link>
      </div>

      <section aria-labelledby="all-tracks-heading" data-testid="training-track-index">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
          Catalog
        </p>
        <h2
          id="all-tracks-heading"
          className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]"
        >
          Tracks
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
          Path level and lesson count — not an essay. Electives sit below.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="All training tracks">
          {[...CORE_TRACKS, ...ELECTIVE_TRACKS].map((track) => (
            <li key={`jump-${track.id}`}>
              <Link
                href={`/training/${track.id}`}
                className="inline-flex rounded-full border border-[var(--ink-border)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-fg)] hover:border-[var(--coral)]/50"
              >
                {track.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_TRACKS.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>

        <div className="mt-10" data-testid="learn-electives">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sun)]">
            Electives
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-[var(--ink-fg)]">
            Prompt Engineering, AI, and FDE
          </h3>
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
            Useful — not the front door. Take them after you can read a query, or whenever you
            want.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ELECTIVE_TRACKS.map((track) => (
              <TrackCard key={track.id} track={track} elective />
            ))}
          </div>
        </div>
      </section>

      <TrainingFilters lessons={lessons} />
    </div>
  );
}
