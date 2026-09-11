"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrainingLesson } from "@/lib/types";
import { SoftBadge } from "./Badge";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { getLessonProgress } from "@/lib/progress";
import { getTrackMeta } from "@/lib/tracks";

export function LessonCard({ lesson }: { lesson: TrainingLesson }) {
  const [done, setDone] = useState(false);
  const trackTitle = getTrackMeta(lesson.track)?.title ?? lesson.track.replace(/-/g, " ");
  useEffect(() => {
    setDone(Boolean(getLessonProgress(lesson.track, lesson.slug)?.completed));
  }, [lesson.track, lesson.slug]);

  return (
    <Link
      href={`/training/${lesson.track}/${lesson.slug}`}
      className="group glass glass-hover flex h-full flex-col rounded-2xl p-4"
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <SoftBadge>{trackTitle}</SoftBadge>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <Clock className="h-3 w-3" /> {lesson.durationMinutes} min
        </span>
        {done ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--mint)]">
            <CheckCircle2 className="h-3 w-3" /> Done
          </span>
        ) : null}
      </div>
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-bold text-[var(--ink-fg)] group-hover:text-[var(--coral)]">
          {lesson.title}
        </h3>
        <BookOpen className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden />
      </div>
      <p className="line-clamp-2 text-sm leading-snug text-[var(--muted)]">{lesson.description}</p>
    </Link>
  );
}
