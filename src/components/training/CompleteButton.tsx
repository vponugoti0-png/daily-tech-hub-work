"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { getLessonProgress, markLessonComplete } from "@/lib/progress";

export function CompleteButton({
  track,
  slug,
  nextHref,
  nextTitle,
}: {
  track: string;
  slug: string;
  nextHref?: string;
  nextTitle?: string;
}) {
  const [done, setDone] = useState(false);
  const [justDone, setJustDone] = useState(false);

  useEffect(() => {
    setDone(Boolean(getLessonProgress(track, slug)?.completed));
  }, [track, slug]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        id="complete"
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-bold transition ${
          done
            ? "bg-[var(--mint)]/20 text-[var(--mint)] ring-1 ring-[var(--mint)]/40"
            : "btn-primary"
        } ${justDone ? "celebrate-pop" : ""}`}
        onClick={() => {
          markLessonComplete(track, slug);
          setDone(true);
          setJustDone(true);
          window.dispatchEvent(new Event("dth-progress"));
        }}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <PartyPopper className="h-4 w-4" />}
        {done ? "Checkpoint complete" : "Mark complete · earn XP"}
      </button>
      {justDone ? (
        <span className="celebrate-pop inline-flex items-center gap-1 rounded-full bg-[var(--sun)]/20 px-2.5 py-1 text-xs font-bold text-[var(--sun)]">
          +XP · nice work!
        </span>
      ) : null}
      {done && nextHref ? (
        <Link
          href={nextHref}
          data-testid="complete-next-cta"
          className="inline-flex min-h-[44px] items-center rounded-[14px] border border-[var(--mint)]/40 bg-[var(--mint)]/10 px-4 py-2 text-sm font-bold text-[var(--ink-fg)] hover:bg-[var(--mint)]/20"
        >
          Next: {nextTitle ?? "Continue"} →
        </Link>
      ) : null}
    </div>
  );
}
