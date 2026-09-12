"use client";

import { useMemo, useState } from "react";
import type { TrainingLesson } from "@/lib/types";
import { LessonCard } from "@/components/LessonCard";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { TRACKS as TRACK_METAS } from "@/lib/tracks";

const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;
const TRACK_FILTERS = ["all", ...TRACK_METAS.map((t) => t.id)] as const;

function trackChipLabel(id: string) {
  if (id === "all") return "All";
  return TRACK_METAS.find((t) => t.id === id)?.title ?? id;
}

export function TrainingFilters({ lessons }: { lessons: TrainingLesson[] }) {
  const [track, setTrack] = useState<(typeof TRACK_FILTERS)[number]>("all");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return lessons.filter((l) => {
      if (track !== "all" && l.track !== track) return false;
      if (level !== "all" && l.level !== level) return false;
      if (!query) return true;
      return `${l.title} ${l.description} ${l.topics.join(" ")}`.toLowerCase().includes(query);
    });
  }, [lessons, track, level, q]);

  return (
    <section className="space-y-5">
      <div className="panel rounded-2xl p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter lessons…"
          className="field mb-3 w-full"
          aria-label="Filter lessons"
        />
        <div className="flex flex-wrap gap-2">
          {TRACK_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                track === t
                  ? "bg-[var(--coral)] font-bold text-[#1a1430]"
                  : "bg-[var(--panel-2)] text-[var(--ink-fg)] ring-1 ring-[var(--ink-border)]",
              )}
            >
              {trackChipLabel(t)}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize",
                level === lv
                  ? "bg-[var(--violet)]/20 font-bold text-[var(--violet)] ring-1 ring-[var(--violet)]/40"
                  : "text-[var(--muted)] hover:bg-[var(--panel-2)]",
              )}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No lessons" body="Adjust filters or search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lesson) => (
            <LessonCard key={`${lesson.track}-${lesson.slug}`} lesson={lesson} />
          ))}
        </div>
      )}
    </section>
  );
}
