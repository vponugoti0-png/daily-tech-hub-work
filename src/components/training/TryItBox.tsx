"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Sparkles } from "lucide-react";

/** W3Schools/Codecademy-style try-it shell (sandbox runtime not live yet). */
export function TryItBox({
  title = "Try it",
  code,
  hint,
  dialect,
  labHref,
  labKind,
}: {
  title?: string;
  code: string;
  hint?: string;
  dialect?: string;
  /** In-lesson local lab (Databricks / Snowflake / SQL / Git Play Lab). Not a top-level nav item. */
  labHref?: string;
  labKind?: "sql" | "git";
}) {
  const [showHint, setShowHint] = useState(false);
  return (
    <div className="tryit my-6 overflow-hidden rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[var(--sun)]" aria-hidden />
          <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-fg)]">
            {title}
          </span>
          {dialect ? (
            <span className="rounded-md bg-[var(--sky)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--sky)]">
              {dialect}
            </span>
          ) : null}
          {labHref ? (
            <span className="rounded-full border border-[var(--coral)]/40 bg-[var(--coral)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--coral)]">
              Local lab below
            </span>
          ) : (
            <span className="rounded-full border border-[var(--sun)]/40 bg-[var(--sun)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--sun)]">
              Coming soon · live Run
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {labHref ? (
            <a
              href={labHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
              aria-label={labKind === "git" ? "Open Git Play Lab" : "Open local practice lab"}
            >
              {labKind === "git" ? "Run in Git Play Lab" : "Run in local lab"}
            </a>
          ) : null}
          <CopyButton text={code} />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-bold text-[var(--muted)]"
            onClick={() => setShowHint(true)}
            aria-expanded={showHint}
          >
            How to practice
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]">
        <code>{code}</code>
      </pre>
      {showHint ? (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--muted)]">
          {labHref
            ? labKind === "git"
              ? "Copy if you want, or run the commands in the Git Play Lab below."
              : "Copy if you want, or run a SQL sample in the local practice lab below."
            : "Live Run isn't ready yet — copy this into Snowflake, Databricks, or your AI chat to practice."}
          {hint ? <span className="mt-1 block font-semibold text-[var(--mint)]">{hint}</span> : null}
        </div>
      ) : (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)]/60 px-3 py-1.5 text-[11px] text-[var(--muted)]">
          {labHref ? (
            <>
              Tip:{" "}
              <strong className="text-[var(--ink-fg)]">
                {labKind === "git" ? "Run in Git Play Lab" : "Run in local lab"}
              </strong>{" "}
              {labKind === "git"
                ? "opens the in-browser git model on this page."
                : "opens the DuckDB practice surface on this page."}
            </>
          ) : (
            <>
              Tip: use <strong className="text-[var(--ink-fg)]">Copy</strong> — the green Play button
              will arrive later (honest!).
            </>
          )}
        </div>
      )}
    </div>
  );
}
