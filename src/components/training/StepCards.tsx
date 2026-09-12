"use client";

import { CheckCircle2 } from "lucide-react";

/** DataCamp-style bite-sized step cards */
export function StepCards({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol
      className={`my-6 grid gap-3 ${steps.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)] p-4"
        >
          <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--signal)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--signal)] text-[10px] text-[var(--ink)]">
              {i + 1}
            </span>
            Step
          </p>
          <h3 className="mt-2 text-sm font-semibold text-[var(--ink-fg)]">{s.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function NextCheckpoint({
  href,
  label,
  done,
}: {
  href: string;
  label: string;
  done?: boolean;
}) {
  return (
    <a
      href={href}
      className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--signal)]/40 bg-[var(--signal)]/10 px-4 py-3 text-sm font-semibold text-[var(--ink-fg)] transition hover:bg-[var(--signal)]/20"
    >
      <span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--signal)]">
          {done ? "Checkpoint cleared" : "Clear next checkpoint"}
        </span>
        {label}
      </span>
      {done ? <CheckCircle2 className="h-5 w-5 text-[var(--signal)]" /> : <span aria-hidden>→</span>}
    </a>
  );
}
