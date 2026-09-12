"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";

/** Editable try-it shell. Lab lessons Run into #lab; others Copy to the learner's tool. */
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
  /** In-lesson local lab (Databricks / Snowflake / SQL / Python / Git). Not a top-level nav item. */
  labHref?: string;
  labKind?: "sql" | "git";
}) {
  const gitLab = labKind === "git";
  const [draft, setDraft] = useState(code);
  const [showHint, setShowHint] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(code);
  }, [code]);

  function editorValue() {
    return editorRef.current?.value ?? draft;
  }

  function runInLab() {
    const next = editorValue();
    setDraft(next);
    const detail: TryItRunDetail = { code: next };
    window.dispatchEvent(new CustomEvent<TryItRunDetail>(TRYIT_RUN_EVENT, { detail }));
    document.getElementById("lab")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
              {gitLab ? "Play Lab below" : "Local lab below"}
            </span>
          ) : (
            <span className="rounded-full border border-[var(--mint)]/40 bg-[var(--mint)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--mint)]">
              Copy to practice
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {labHref ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--coral)]/40 bg-[var(--coral)]/15 px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
              onClick={runInLab}
              aria-label={gitLab ? "Run in Git Play Lab" : "Run in local lab"}
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              Run
            </button>
          ) : null}
          <CopyButton text={editorValue()} label={labHref ? "Copy" : "Copy to practice"} />
          {labHref ? (
            <a
              href={labHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
              aria-label={gitLab ? "Open Git Play Lab" : undefined}
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
      <label className="block px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Editor
        <textarea
          ref={editorRef}
          className="field mt-1 min-h-[140px] w-full resize-y font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]"
          value={draft}
          spellCheck={false}
          aria-label="Try it editor"
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      {showHint ? (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--muted)]">
          Copy this example and run it in your warehouse, notebook, repo, or AI chat.
          {hint ? <span className="mt-1 block font-semibold text-[var(--mint)]">{hint}</span> : null}
        </div>
      ) : (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)]/60 px-3 py-1.5 text-[11px] text-[var(--muted)]">
          {labHref ? (
            <>
              Tip: edit the sample, then <strong className="text-[var(--ink-fg)]">Run</strong> loads
              it into the {gitLab ? "Git Play Lab graph + CLI" : "local practice lab"} on this page.
            </>
          ) : (
            <>
              Tip: edit if you want, then use{" "}
              <strong className="text-[var(--ink-fg)]">Copy to practice</strong> — paste this
              example in your own tool. No in-browser runtime on this page.
            </>
          )}
        </div>
      )}
    </div>
  );
}
