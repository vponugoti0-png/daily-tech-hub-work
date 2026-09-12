import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLessons, getLesson, getLessonsByTrack } from "@/lib/content";
import { getTrackMeta } from "@/lib/tracks";
import { Markdown } from "@/components/Markdown";
import { SoftBadge, TopicBadge } from "@/components/Badge";
import { formatDate } from "@/lib/dates";
import { ArrowLeft, Clock, ListChecks } from "lucide-react";
import { CourseOutline } from "@/components/training/CourseOutline";
import { Quiz } from "@/components/training/Quiz";
import { CompleteButton } from "@/components/training/CompleteButton";
import { TryItBox } from "@/components/training/TryItBox";
import { CheatSheet } from "@/components/training/CheatSheet";
import { StepCards } from "@/components/training/StepCards";
import { LocalPracticeLab } from "@/components/training/LocalPracticeLab";
import { isLabLesson } from "@/lib/lab/samples";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ track: l.track, slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}): Promise<Metadata> {
  const { track, slug } = await params;
  const lesson = getLesson(track, slug);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}) {
  const { track, slug } = await params;
  const lesson = getLesson(track, slug);
  if (!lesson) notFound();

  const siblings = getLessonsByTrack(lesson.track);
  const idx = siblings.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  const isAiTrack =
    lesson.track === "prompt-engineering" || lesson.track === "ai-data-eng";
  const isFdeTrack = lesson.track === "forward-deployed";
  const trackTitle = getTrackMeta(lesson.track)?.title ?? lesson.track;
  const showLab = isLabLesson(lesson.track, lesson.slug);
  const tryItLimit = isAiTrack || isFdeTrack ? 4 : 3;
  const tryItEntries = (lesson.cheatSheet ?? []).filter((e) => e.code).slice(0, tryItLimit);
  const tryItDialect =
    lesson.track === "sql"
      ? "ANSI SQL"
      : lesson.track === "snowflake"
        ? "Snowflake SQL"
        : lesson.track === "databricks"
          ? "Spark SQL / PySpark"
          : lesson.track === "python"
            ? "Python"
            : lesson.track === "git"
              ? "Git"
              : lesson.track === "forward-deployed"
                ? "FDE checklist"
                : "AI chat";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <CourseOutline lessons={siblings} currentSlug={lesson.slug} track={lesson.track} />

      <article className="lesson-column min-w-0 flex-1">
        <Link
          href={`/training/${lesson.track}`}
          className="mb-5 mt-3 inline-flex min-h-[40px] items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--coral)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {trackTitle}
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SoftBadge>{trackTitle}</SoftBadge>
          <SoftBadge className="capitalize">{lesson.level}</SoftBadge>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock className="h-3.5 w-3.5" /> {lesson.durationMinutes} min
          </span>
          <span className="text-xs text-[var(--muted)]">Updated {formatDate(lesson.updatedAt)}</span>
        </div>

        <h1
          id="learn"
          className="scroll-mt-24 font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)] sm:text-4xl"
        >
          {lesson.title}
        </h1>
        <p className="mt-3 text-base text-[var(--muted)]">{lesson.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {lesson.topics.map((t) => (
            <TopicBadge key={t} topic={t} />
          ))}
        </div>

        {lesson.objectives.length ? (
          <div className="mt-8 rounded-2xl border border-[var(--violet)]/30 bg-[var(--violet)]/10 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-[var(--violet)]">
              <ListChecks className="h-4 w-4" /> Objectives
            </h2>
            <ul className="space-y-2 text-sm text-[var(--ink-fg)]">
              {lesson.objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--coral)]" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {isAiTrack ? (
          <StepCards
            steps={[
              { title: "Learn", body: "Read the short lesson — keep it bite-sized." },
              { title: "Try it", body: "Copy the prompt/example and run it in your AI tool." },
              { title: "Quiz", body: "Check understanding, then mark the checkpoint." },
            ]}
          />
        ) : isFdeTrack ? (
          <StepCards
            steps={[
              { title: "Learn", body: "Read the engagement pattern — keep it customer-shaped." },
              { title: "Copy a card", body: "Cheat sheets are checklists you paste into a ticket." },
              { title: "Quiz", body: "Check understanding, then mark the checkpoint." },
            ]}
          />
        ) : showLab ? (
          <StepCards
            steps={[
              { title: "Learn", body: "Read the short lesson — the lab does not gate reading." },
              {
                title: "Practice lab",
                body: "Cheat sheet → Try it → run a sample in the local (DuckDB) lab.",
              },
              { title: "Quiz", body: "Check understanding, then mark the checkpoint." },
            ]}
          />
        ) : null}

        {lesson.cheatSheet?.length ? <CheatSheet entries={lesson.cheatSheet} /> : null}

        {tryItEntries.map((entry, i) => {
          const code = entry.code.replace(/\\n/g, "\n");
          const isSql = /SNOWFLAKE\.CORTEX/i.test(code);
          const dialect = isSql ? "Snowflake SQL" : isAiTrack ? "AI chat" : tryItDialect;
          const defaultHint = isAiTrack
            ? isSql
              ? "Copy into a Snowflake worksheet. Treat model output as untrusted."
              : "Paste into Claude, Copilot Chat, or Grok — then iterate."
            : isFdeTrack
              ? "Copy into a ticket, runbook, or customer notes. No live cloud deploy on this page."
              : "Copy this example into your warehouse, notebook, or repo to practice.";
          return (
            <TryItBox
              key={`${entry.label}-${i}`}
              title={isAiTrack && i === 0 ? "Try this prompt" : i === 0 ? "Try it" : entry.label}
              code={code}
              dialect={dialect}
              hint={entry.note ?? defaultHint}
              labHref={showLab ? "#lab" : undefined}
              anchor={i === 0}
            />
          );
        })}

        {showLab ? <LocalPracticeLab track={lesson.track} slug={lesson.slug} /> : null}

        <div className="mt-10">
          <Markdown source={lesson.content} />
        </div>

        {lesson.quiz?.length ? (
          <Quiz questions={lesson.quiz} track={lesson.track} slug={lesson.slug} />
        ) : null}

        <div className="mt-10 space-y-3 border-t border-[var(--ink-border)] pt-6">
          <CompleteButton track={lesson.track} slug={lesson.slug} />
          <p className="text-xs text-[var(--muted)]">
            Progress saves locally; signed-in users sync to the free SQLite store.
          </p>
          {next ? (
            <Link
              href={`/training/${next.track}/${next.slug}`}
              className="inline-flex min-h-[44px] items-center rounded-[14px] border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-4 py-2 text-sm font-bold text-[var(--ink-fg)] hover:bg-[var(--coral)]/20"
            >
              Next checkpoint: {next.title} →
            </Link>
          ) : null}
        </div>

        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {prev ? (
            <Link
              href={`/training/${prev.track}/${prev.slug}`}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink-fg)]"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/training/${next.track}/${next.slug}`}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink-fg)] sm:text-right"
            >
              {next.title} →
            </Link>
          ) : null}
        </nav>
      </article>
    </div>
  );
}
