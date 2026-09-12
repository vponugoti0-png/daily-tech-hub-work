import type { Metadata } from "next";
import Link from "next/link";
import { getAllLessons, getLesson, getLessonsByTrack } from "@/lib/content";
import { SectionHeader } from "@/components/SectionHeader";
import { META_DE_OVERLAY, TRACKS } from "@/lib/tracks";
import { TrainingFilters } from "@/components/training/TrainingFilters";

export const metadata: Metadata = {
  title: "Training",
  description:
    "Free interactive tracks: Prompt Engineering, AI for DE, Python, SQL, Databricks, Snowflake, Forward Deployed Engineer, Git.",
};

export default function TrainingPage() {
  const lessons = getAllLessons();
  const practiceLesson = getLesson("ai-data-eng", "ai-de-practice-agents");
  const capstoneChecklist = getLesson("sql", "sql-shared-capstone-checklist");
  const etlBuilders = [
    getLesson("python", "python-etl-pipeline-builder"),
    getLesson("sql", "sql-staging-mart-etl"),
    getLesson("databricks", "dbx-medallion-etl-builder"),
    getLesson("snowflake", "sf-warehouse-etl-builder"),
  ].filter((l): l is NonNullable<typeof l> => Boolean(l));
  const gitPlayLab = getLesson("git", "git-play-lab");
  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Training · 100% free"
        title="Interactive course tracks"
        description="Bite-sized lessons with try-it shells, quizzes, and cert-style checkpoints. No paywalls."
      />

      <div className="panel rounded-3xl p-5">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sky)]">
          {META_DE_OVERLAY.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
          {META_DE_OVERLAY.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">{META_DE_OVERLAY.blurb}</p>
        <ul className="mt-3 space-y-1 text-sm text-[var(--ink-fg)]">
          <li>
            <span className="font-semibold text-[var(--mint)]">SQL · </span>
            {META_DE_OVERLAY.sqlOrder}
          </li>
          <li>
            <span className="font-semibold text-[var(--sun)]">Python · </span>
            {META_DE_OVERLAY.pythonOrder}
          </li>
          <li>
            <span className="font-semibold text-[var(--coral)]">Databricks · </span>
            {META_DE_OVERLAY.databricksOrder}
          </li>
          <li>
            <span className="font-semibold text-[var(--sky)]">Snowflake · </span>
            {META_DE_OVERLAY.snowflakeOrder}
          </li>
          <li>
            <span className="font-semibold text-[var(--violet)]">ETL spine · </span>
            {META_DE_OVERLAY.etlSpine}
          </li>
        </ul>
      </div>

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

      {capstoneChecklist ? (
        <Link
          href={`/training/${capstoneChecklist.track}/${capstoneChecklist.slug}`}
          className="panel glass-hover flex flex-col gap-3 rounded-3xl border-2 border-[var(--mint)]/35 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--mint)]">
              Shared capstone · Orders → daily revenue mart
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
              {capstoneChecklist.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              {capstoneChecklist.description} Cross-track checklist — not a new nav item.
            </p>
          </div>
          <span className="btn-ghost shrink-0 self-start sm:self-center">Open checklist →</span>
        </Link>
      ) : null}

      {gitPlayLab ? (
        <Link
          href={`/training/${gitPlayLab.track}/${gitPlayLab.slug}#lab`}
          className="panel glass-hover flex flex-col gap-3 rounded-3xl border-2 border-[var(--violet)]/35 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">
              Git Play Lab · Product A
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]">
              {gitPlayLab.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
              {gitPlayLab.description} Visual commit tree + sandbox CLI in the browser — not a
              Practice VM, not a real remote.
            </p>
          </div>
          <span className="btn-ghost shrink-0 self-start sm:self-center">Open Git Play Lab →</span>
        </Link>
      ) : null}

      {etlBuilders.length === 4 ? (
        <section
          aria-labelledby="etl-builders-heading"
          className="panel rounded-3xl border-2 border-[var(--sun)]/35 p-5"
        >
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sun)]">
            Build ETL · four tool tracks
          </p>
          <h2
            id="etl-builders-heading"
            className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]"
          >
            Extract → transform → load on each major track
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
            After W0–W4 and the Databricks / Snowflake / SQL Practice labs, build one ETL per tool.
            Same Training routes — not a new nav item. Forward Deployed Engineer is a separate
            card on this page (after the tool tracks, before Git).
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {etlBuilders.map((lesson) => (
              <li key={`${lesson.track}-${lesson.slug}`}>
                <Link
                  href={`/training/${lesson.track}/${lesson.slug}`}
                  className="glass-hover block rounded-2xl border border-[var(--ink-border)] px-4 py-3"
                >
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
                    {lesson.track}
                  </span>
                  <span className="mt-1 block font-semibold text-[var(--ink-fg)]">{lesson.title}</span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">{lesson.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
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
