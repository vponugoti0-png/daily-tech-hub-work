"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrainingLesson } from "@/lib/types";
import { getLessonProgress } from "@/lib/progress";
import { displayLessonTitle } from "@/lib/learner-paths";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

function OutlineList({
  lessons,
  currentSlug,
  track,
  done,
}: {
  lessons: TrainingLesson[];
  currentSlug: string;
  track: string;
  done: Record<string, boolean>;
}) {
  return (
    <ol className="space-y-1">
      {lessons.map((l) => {
        const active = l.slug === currentSlug;
        return (
          <li key={l.slug}>
            <Link
              href={`/training/${track}/${l.slug}`}
              className={cn(
                "flex min-h-[40px] items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                active
                  ? "bg-[var(--coral)]/15 text-[var(--ink-fg)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--ink-fg)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                  done[l.slug]
                    ? "bg-[var(--mint)]/20 text-[var(--mint)]"
                    : "bg-[var(--panel-2)] text-[var(--muted)]",
                )}
              >
                {done[l.slug] ? <Check className="h-3 w-3" /> : <span aria-hidden />}
              </span>
              <span className="leading-snug">{displayLessonTitle(l.title)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function CourseOutline({
  lessons,
  currentSlug,
  track,
}: {
  lessons: TrainingLesson[];
  currentSlug: string;
  track: string;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [labDone, setLabDone] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const m: Record<string, boolean> = {};
      for (const l of lessons) {
        m[l.slug] = Boolean(getLessonProgress(track, l.slug)?.completed);
      }
      setDone(m);
      setLabDone((getLessonProgress(track, currentSlug)?.stepIndex ?? 0) >= 1);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [lessons, track, currentSlug]);

  const current = lessons.find((l) => l.slug === currentSlug);
  const currentDone = Boolean(done[currentSlug]);

  return (
    <>
      {/* Mobile disclosure */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          className="flex w-full min-h-[44px] items-center justify-between rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-bold text-[var(--ink-fg)]"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Course outline
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
        </button>
        {open ? (
          <div className="mt-2 rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)] p-3">
            <OutlineList lessons={lessons} currentSlug={currentSlug} track={track} done={done} />
          </div>
        ) : null}
      </div>

      <aside className="panel sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto rounded-2xl p-4 lg:block">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          Course outline
        </p>
        <OutlineList lessons={lessons} currentSlug={currentSlug} track={track} done={done} />
        {current?.steps?.length ? (
          <div className="mt-5 border-t border-[var(--ink-border)] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              This lesson
            </p>
            <ul className="space-y-1">
              {current.steps.map((s) => {
                const stepDone =
                  (s.id === "complete" && currentDone) || (s.id === "lab" && labDone);
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--ink-fg)]"
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm",
                          stepDone
                            ? "bg-[var(--mint)]/20 text-[var(--mint)]"
                            : "border border-[var(--ink-border)]",
                        )}
                        aria-hidden
                      >
                        {stepDone ? <Check className="h-2.5 w-2.5" /> : null}
                      </span>
                      {s.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </aside>
    </>
  );
}
