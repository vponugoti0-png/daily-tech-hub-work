"use client";

import type { ReactNode } from "react";

import { useId, useState } from "react";
import { findJargon, type JargonEntry } from "@/lib/jargon";
import { cn } from "@/lib/utils";

export function JargonTip({
  term,
  children,
  className,
}: {
  term: string;
  children?: ReactNode;
  className?: string;
}) {
  const entry = findJargon(term);
  const tipId = useId();
  const [open, setOpen] = useState(false);

  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="jargon-chip cursor-help rounded-full border border-dashed border-[var(--sky)]/45 bg-[var(--sky)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--sky)] underline decoration-dotted underline-offset-2"
        aria-describedby={open ? tipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {children ?? entry.term}
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="absolute bottom-[calc(100%+6px)] left-1/2 z-40 w-56 -translate-x-1/2 rounded-xl border border-[var(--ink-border)] bg-[var(--panel)] p-2.5 text-left text-xs shadow-lg"
        >
          <span className="block font-display font-bold text-[var(--ink-fg)]">
            {entry.term} = {entry.plain}
          </span>
          {entry.tip ? (
            <span className="mt-1 block text-[var(--muted)]">{entry.tip}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/** Kid-friendly chips shown on Home + Training (DE / DBX / ETL / …). */
export const HOME_TRAINING_JARGON = ["DE", "DBX", "ETL", "SQL", "Pipeline"] as const;

export function JargonChips({
  terms = HOME_TRAINING_JARGON,
}: {
  terms?: readonly string[];
}) {
  const entries = terms
    .map((term) => findJargon(term))
    .filter((e): e is JargonEntry => Boolean(e));

  return (
    <div data-testid="jargon-chips" aria-label="Plain English jargon" className="flex flex-wrap gap-2">
      {entries.map((e) => (
        <JargonTip key={e.term} term={e.term}>
          {e.term} = {e.plain}
        </JargonTip>
      ))}
    </div>
  );
}

export function JargonLegend({ entries = [] as JargonEntry[] }: { entries?: JargonEntry[] }) {
  const list = entries.length
    ? entries
    : [
        findJargon("DE")!,
        findJargon("DBX")!,
        findJargon("ETL")!,
        findJargon("SQL")!,
        findJargon("Pipeline")!,
      ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-[var(--sky)]/25 bg-[var(--sky)]/8 p-3 sm:p-4">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
        Plain-English cheat sheet
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {list.map((e) => (
          <li key={e.term} className="text-xs text-[var(--muted)]">
            <span className="font-bold text-[var(--ink-fg)]">{e.term}</span>
            {" — "}
            {e.plain}
            {e.tip ? <span className="block text-[11px] opacity-90">{e.tip}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
