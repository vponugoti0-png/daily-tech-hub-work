"use client";

import { useRef, useState } from "react";
import { Play, Sparkles } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";

/** Example / copy shell. Lab lessons load into #lab (no second textarea). */
export function TryItBox({
  title = "Example",
  code,
  hint,
  dialect,
  labHref,
  labKind,
  variant,
}: {
  title?: string;
  code: string;
  hint?: string;
  dialect?: string;
  /** In-lesson local lab (Databricks / Snowflake / SQL / Python / Git / AI). Not a top-level nav item. */
  labHref?: string;
  labKind?: "sql" | "git" | "ai";
  /** `reference` = statement + Load/Copy. `editor` = copy-only textarea (no #lab). */
  variant?: "editor" | "reference";
}) {
  const gitLab = labKind === "git";
  const aiLab = labKind === "ai";
  const reference = variant === "reference" || Boolean(labHref);
  const [draft, setDraft] = useState(code);
  const [codeSnapshot, setCodeSnapshot] = useState(code);
  const [showHint, setShowHint] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  if (code !== codeSnapshot) {
    setCodeSnapshot(code);
    setDraft(code);
  }

  function editorValue() {
    if (reference) return code;
    return editorRef.current?.value ?? draft;
  }

  function loadIntoLab() {
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
              {gitLab ? "Play Lab below" : aiLab ? "Local practice below" : "Local lab below"}
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
              onClick={loadIntoLab}
              aria-label={
                gitLab ? "Run in Git Play Lab" : aiLab ? "Run in local practice" : "Run in local lab"
              }
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              Load into Practice
            </button>
          ) : null}
          <CopyButton text={reference ? code : draft} label={labHref ? "Copy" : "Copy to practice"} />
          {labHref ? (
            <a
              href={labHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-bold text-[var(--ink-fg)]"
              aria-label={gitLab ? "Open Git Play Lab" : aiLab ? "Open Local practice" : undefined}
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
      {reference ? (
        <div className="px-3 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Statement
          </p>
          <pre className="mt-1 overflow-x-auto rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60 p-3 font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
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
      )}
      {showHint ? (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--muted)]">
          Copy this example and run it in your warehouse, notebook, repo, or AI chat.
          {hint ? <span className="mt-1 block font-semibold text-[var(--mint)]">{hint}</span> : null}
        </div>
      ) : (
        <div className="border-t border-[var(--ink-border)] bg-[var(--panel-2)]/60 px-3 py-1.5 text-[11px] text-[var(--muted)]">
          {labHref ? (
            <>
              Tip: <strong className="text-[var(--ink-fg)]">Load into Practice</strong> fills the
              single editor in the{" "}
              {gitLab
                ? "Git Play Lab graph + CLI"
                : aiLab
                  ? "Local practice checklist"
                  : "local practice lab"}{" "}
              on this page. No second textarea.
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
