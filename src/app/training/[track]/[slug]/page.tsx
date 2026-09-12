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
import { StepCards } from "@/components/training/StepCards";
import { LocalPracticeLab } from "@/components/training/LocalPracticeLab";
import { AiLocalPractice } from "@/components/training/AiLocalPractice";
import { GitPlayLab } from "@/components/training/git/GitPlayLab";
import { JargonChips } from "@/components/JargonTip";
import { ExampleSection } from "@/components/training/ExampleSection";
import { LessonPathCrumb } from "@/components/training/LessonPathCrumb";
import { LessonReferenceRail } from "@/components/training/LessonReferenceRail";
import { isAiLabLesson, isGitPlayLesson, isLabLesson } from "@/lib/lab/samples";
import {
  pathCrumbForLesson,
  shortcutPackForTrack,
  splitLessonExamples,
  tryItDialectForTrack,
} from "@/lib/lesson-chrome";

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
  const showGitLab = isGitPlayLesson(lesson.track, lesson.slug);
  const showAiLab = isAiLabLesson(lesson.track, lesson.slug);
  const showPractice = showLab || showGitLab || showAiLab;
  const showStarterJargon = idx === 0 || (lesson.level === "beginner" && lesson.order <= 1);
  const { example, extraExamples, leftover } = splitLessonExamples(lesson.cheatSheet);
  const tryItDialect = tryItDialectForTrack(lesson.track);
  const labHref = showPractice ? "#lab" : undefined;
  const labKind = showGitLab ? "git" : showAiLab ? "ai" : showLab ? "sql" : undefined;
  const pathCrumb = pathCrumbForLesson(lesson.track, lesson.slug);
  const shortcutPack = shortcutPackForTrack(lesson.track);

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

        {pathCrumb ? <LessonPathCrumb crumb={pathCrumb} /> : null}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SoftBadge>{trackTitle}</SoftBadge>
          <SoftBadge className="capitalize">{lesson.level}</SoftBadge>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock className="h-3.5 w-3.5" /> {lesson.durationMinutes} min
          </span>
          <span className="text-xs text-[var(--muted)]">Updated {formatDate(lesson.updatedAt)}</span>
        </div>

        <section id="learn" data-testid="lesson-learn" className="scroll-mt-24">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink-fg)] sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 text-base text-[var(--muted)]">{lesson.description}</p>

          {showStarterJargon ? (
            <div className="plain-english-panel mt-6">
              <JargonChips />
            </div>
          ) : null}

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

          <StepCards
            steps={
              showPractice
                ? [
                    { title: "Learn", body: "Read the teaching text — then try the example." },
                    {
                      title: "Example",
                      body: "One worked statement. Extra samples hide behind More examples.",
                    },
                    {
                      title: "Practice",
                      body: showGitLab
                        ? "Load the example into Git Play Lab and run it on this page."
                        : showAiLab
                          ? "Load the example into Local practice — or Copy into your own AI tool."
                          : lesson.track === "python"
                            ? "Load the example into the local (Pyodide) lab and Run."
                            : "Load the example into the local (DuckDB) lab and Run.",
                    },
                    { title: "Quiz", body: "Check understanding, then mark the checkpoint." },
                  ]
                : [
                    { title: "Learn", body: "Read the teaching text — then copy the example." },
                    {
                      title: "Example",
                      body: "One worked snippet. Extra samples hide behind More examples.",
                    },
                    {
                      title: "Copy",
                      body: isAiTrack
                        ? "Edit if you want, then Copy into your AI tool. No empty editor."
                        : isFdeTrack
                          ? "Edit if you want, then Copy into notes or a runbook. No empty editor."
                          : "Edit if you want, then Copy into your warehouse, notebook, or repo. No empty editor.",
                    },
                    { title: "Quiz", body: "Check understanding, then mark the checkpoint." },
                  ]
            }
          />

          <div className="mt-10" data-testid="lesson-markdown">
            <Markdown source={lesson.content} />
          </div>
        </section>

        {example ? (
          <ExampleSection
            example={example}
            extras={extraExamples}
            dialect={tryItDialect}
            labHref={labHref}
            labKind={labKind}
            isAiTrack={isAiTrack}
            isFdeTrack={isFdeTrack}
            showGitLab={showGitLab}
            showAiLab={showAiLab}
          />
        ) : null}

        {showGitLab ? <GitPlayLab track={lesson.track} slug={lesson.slug} /> : null}
        {showLab ? <LocalPracticeLab track={lesson.track} slug={lesson.slug} /> : null}
        {showAiLab ? <AiLocalPractice track={lesson.track} slug={lesson.slug} /> : null}

        {lesson.quiz?.length ? (
          <Quiz questions={lesson.quiz} track={lesson.track} slug={lesson.slug} />
        ) : null}

        <div className="mt-10 space-y-3 border-t border-[var(--ink-border)] pt-6">
          <CompleteButton track={lesson.track} slug={lesson.slug} />
          <p className="text-xs text-[var(--muted)]">
            Progress saves on this device. Sign-in is optional.
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

        <LessonReferenceRail leftover={leftover} pack={shortcutPack} />
      </article>
    </div>
  );
}
