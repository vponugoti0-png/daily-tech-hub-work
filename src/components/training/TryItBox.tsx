"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { dispatchTryItRun } from "@/lib/lab/tryit-run";
import { Sparkles } from "lucide-react";

function looksRunnableSql(text: string): boolean {
  return /^\s*(SELECT|WITH|FROM|SHOW|DESCRIBE|EXPLAIN)\b/i.test(text);
}

/** Try-it shell: editable pane. Lab lessons Run → #lab; others are copy-to-practice. */
export function TryItBox({
  title = "Try it",
  code,
  hint,
  dialect,
  labHref,
  labKind,
  anchor = false,
}: {
  title?: string;
  code: string;
  hint?: string;
  dialect?: string;
  /** In-lesson local lab (Databricks / Snowflake / SQL / Python). Not a top-level nav item. */
  labHref?: string;
  labKind?: "sql" | "python";
  /** First TryIt on the page gets id="tryit" for layout order + outline. */
  anchor?: boolean;
}) {
  const [draft, setDraft] = useState(code);
  const [showHint, setShowHint] = useState(false);
  const editorId = useId();

  return (
    <div
      id={anchor ? "tryit" : undefined}
      className="tryit my-6 scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)]"
    >
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
            <span className="rounded-full border border-[var(--mint)]/40 bg-[var(--mint)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--mint)]">
              Copy to practice
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {labHref ? (
            <a
              href={labHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
              aria-label="Run in local lab"
              onClick={() => {
                if (labKind === "python" || looksRunnableSql(draft)) dispatchTryItRun(draft);
              }}
            >
              Run
            </a>
          ) : null}
          <CopyButton text={draft} label={labHref ? "Copy" : "Copy to practice"} />
          {labHref ? (
            <a
              href={labHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
            >
              How to practice
            </a>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-bold text-[var(--muted)]"
              onClick={() => setShowHint(true)}
              aria-expanded={showHint}
            >
              How to practice
            </button>
          )}
        </div>
      </div>
      <label className="sr-only" htmlFor={editorId}>
        Try it editor
      </label>
      <textarea
        id={editorId}
        className="field min-h-[140px] w-full resize-y rounded-none border-0 bg-transparent p-3 font-mono text-[12px] leading-relaxed"
        value={draft}
        spellCheck={false}
        aria-label="Try it editor"
        onChange={(e) => setDraft(e.target.value)}
      />
      {showHint ? (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--muted)]">
          Copy this example and run it in your warehouse, notebook, repo, or AI chat.
          {hint ? <span className="mt-1 block font-semibold text-[var(--mint)]">{hint}</span> : null}
        </div>
      ) : (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)]/60 px-3 py-1.5 text-[11px] text-[var(--muted)]">
          {labHref ? (
            <>
              Tip: edit this pane, then <strong className="text-[var(--ink-fg)]">Run</strong> opens the
              local lab on this page and executes your text.
            </>
          ) : (
            <>
              Tip: edit if you want, then use <strong className="text-[var(--ink-fg)]">Copy to practice</strong>{" "}
              — paste in your own tool. No in-browser runtime on this page.
            </>
          )}
        </div>
      )}
    </div>
  );
}
