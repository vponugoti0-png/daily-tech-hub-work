import type { Metadata } from "next";
import Link from "next/link";
import { getAllLessons, getLesson, getLessonsByTrack } from "@/lib/content";
import { SectionHeader } from "@/components/SectionHeader";
import { TRACKS } from "@/lib/tracks";
import { TrainingFilters } from "@/components/training/TrainingFilters";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Free interactive tracks: Prompt Engineering, AI for DE, Python, SQL, Databricks, Snowflake, Git.",
};

export default function TrainingPage() {
  const lessons = getAllLessons();
  const practiceLesson = getLesson("ai-data-eng", "ai-de-practice-agents");
  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Training · 100% free"
        title="Interactive course tracks"
        description="Bite-sized lessons with try-it shells, quizzes, and cert-style checkpoints. No paywalls."
      />

      {practiceLesson ? (
        <Link
          href={`/training/${practiceLesson.track}/${practiceLesson.slug}`}
          className="panel glass-hover flex flex-col gap-3 rounded-3xl border-2 border-[var(--coral)]/35 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
              Start here · Practice with agents
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
              {practiceLesson.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              {practiceLesson.description} Guest-friendly and free — same progress model as every
              other lesson.
            </p>
          </div>
          <span className="btn-primary shrink-0 self-start sm:self-center">Open lesson →</span>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKS.map((track) => {
          const trackLessons = getLessonsByTrack(track.id);
          const mins = trackLessons.reduce((a, l) => a + l.durationMinutes, 0);
          return (
            <Link
              key={track.id}
              href={`/training/${track.id}`}
              className="panel glass-hover rounded-3xl p-5"
            >
              <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${track.accent}`} />
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--ink-fg)]">{track.title}</h2>
                {track.badge ? (
                  <span className="rounded-full bg-[var(--mint)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--mint)]">
                    {track.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{track.blurb}</p>
              <p className="mt-4 text-xs text-[var(--muted)]">
                {trackLessons.length} lessons · ~{Math.round(mins / 60)}h {mins % 60}m ·{" "}
                {track.difficulty}
              </p>
            </Link>
          );
        })}
      </div>

      <TrainingFilters lessons={lessons} />
    </div>
  );
}
