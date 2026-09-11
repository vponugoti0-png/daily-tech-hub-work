"use client";

import { useEffect, useState } from "react";
import { trackCompletion } from "@/lib/progress";

export function TrackProgressBar({ track, slugs }: { track: string; slugs: string[] }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const t = trackCompletion(track, slugs);
      setPct(t.pct);
      setDone(t.done);
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("dth-progress", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("dth-progress", refresh);
    };
  }, [track, slugs]);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs text-[var(--muted)]">
        <span>Progress</span>
        <span>
          {done}/{slugs.length} · {pct}%
        </span>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${pct === 100 ? "done" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
