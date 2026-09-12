"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FlaskConical, Play } from "lucide-react";
import { getLessonProgress, upsertLessonProgress } from "@/lib/progress";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";
import {
  LAB_STEP_INDEX,
  isPythonLabLesson,
  samplesForLesson,
  sampleSource,
  type LabSample,
} from "@/lib/lab/samples";
import type { LabQueryResult } from "@/lib/lab/duckdb-client";
import type { LabPythonResult } from "@/lib/lab/pyodide-client";

export function LocalPracticeLab({ track, slug }: { track: string; slug: string }) {
  const python = isPythonLabLesson(track, slug);
  const samples = useMemo(() => samplesForLesson(slug), [slug]);
  const titleId = useId();
  const [sampleId, setSampleId] = useState(samples[0]?.id ?? "");
  const [source, setSource] = useState(samples[0] ? sampleSource(samples[0]) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlResult, setSqlResult] = useState<LabQueryResult | null>(null);
  const [pythonResult, setPythonResult] = useState<LabPythonResult | null>(null);
  const [labSaved, setLabSaved] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setLabSaved((getLessonProgress(track, slug)?.stepIndex ?? 0) >= LAB_STEP_INDEX);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [track, slug]);

  function applySample(next: LabSample) {
    setSampleId(next.id);
    setSource(sampleSource(next));
    setError(null);
  }

  async function runSource(nextSource: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (python) {
        const { runLabPython } = await import("@/lib/lab/pyodide-client");
        const next = await runLabPython(nextSource);
        setPythonResult(next);
        setSqlResult(null);
      } else {
        const { runLabSql } = await import("@/lib/lab/duckdb-client");
        const next = await runLabSql(nextSource);
        setSqlResult(next);
        setPythonResult(null);
      }
      upsertLessonProgress(track, slug, { stepIndex: LAB_STEP_INDEX });
      setLabSaved(true);
      window.dispatchEvent(new Event("dth-progress"));
    } catch (err) {
      setSqlResult(null);
      setPythonResult(null);
      setError(err instanceof Error ? err.message : "The local lab could not run that sample.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    function onTryIt(event: Event) {
      const code = (event as CustomEvent<TryItRunDetail>).detail?.code;
      if (typeof code !== "string") return;
      setSource(code);
      const match = samples.find((s) => sampleSource(s).trim() === code.trim());
      if (match) setSampleId(match.id);
      void runSource(code);
    }
    window.addEventListener(TRYIT_RUN_EVENT, onTryIt);
    return () => window.removeEventListener(TRYIT_RUN_EVENT, onTryIt);
    // Intentionally omit runSource — listener always reads latest samples/python via closure refresh on slug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [python, samples, busy]);

  const current = samples.find((s) => s.id === sampleId);
  const engineLabel = python ? "Pyodide · in-browser" : "DuckDB · in-browser";
  const honest =
    python
      ? "Not a live Databricks / cloud Python kernel. Samples run locally in your browser — no shell, no network, no credentials."
      : track === "snowflake"
        ? "Not a live Snowflake account. SQL samples run locally in your browser — no cloud credentials, no shell."
        : track === "sql"
          ? "Not a live warehouse. SQL samples run locally in your browser — no cloud credentials, no shell."
          : "Not a live Databricks workspace. SQL samples run locally in your browser — no cloud credentials, no shell.";

  return (
    <section
      id="lab"
      aria-labelledby={titleId}
      className="tryit lab-surface my-6 scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-[var(--coral)]" aria-hidden />
          <h2
            id={titleId}
            className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-fg)]"
          >
            Local practice lab
          </h2>
          <span className="rounded-md bg-[var(--sky)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--sky)]">
            {engineLabel}
          </span>
        </div>
        {labSaved ? (
          <p className="text-[11px] font-semibold text-[var(--mint)]" role="status">
            Lab step saved on this device
          </p>
        ) : null}
      </div>

      <div className="space-y-3 px-3 py-3">
        <p className="text-sm text-[var(--muted)]">{honest}</p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-xs font-semibold text-[var(--ink-fg)]">
            {python ? "Python sample" : "SQL sample"}
            <select
              className="field mt-1 w-full text-sm"
              value={sampleId}
              aria-label={python ? "Python sample" : "SQL sample"}
              onChange={(e) => {
                const next = samples.find((s) => s.id === e.target.value);
                if (next) applySample(next);
              }}
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-primary shrink-0"
            onClick={() => void runSource(source)}
            disabled={busy}
            aria-label={python ? "Run Python sample" : "Run SQL sample"}
            aria-busy={busy}
          >
            <Play className="h-4 w-4" aria-hidden />
            {busy ? "Running…" : "Run sample"}
          </button>
        </div>

        <label className="block text-xs font-semibold text-[var(--ink-fg)]">
          {python ? "Python to run" : "SQL to run"}
          <textarea
            className="field mt-1 min-h-[140px] w-full resize-y font-mono text-[12px] leading-relaxed"
            value={source}
            spellCheck={false}
            aria-label={python ? "Python to run" : "SQL to run"}
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
        {current?.note ? <p className="text-xs text-[var(--muted)]">{current.note}</p> : null}

        {busy ? (
          <p className="text-sm text-[var(--sky)]" role="status">
            Starting local engine…
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-3 py-2 text-sm text-[var(--ink-fg)]" role="alert">
            {error}
          </p>
        ) : null}

        {sqlResult ? <LabResultTable result={sqlResult} /> : null}
        {pythonResult ? <PythonResult result={pythonResult} /> : null}
      </div>
    </section>
  );
}

function PythonResult({ result }: { result: LabPythonResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60">
      <pre
        className="whitespace-pre-wrap px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]"
        aria-label="Python result"
      >
        {result.text}
      </pre>
      {result.truncated ? (
        <p className="px-3 py-2 text-[11px] text-[var(--muted)]">Output truncated</p>
      ) : null}
    </div>
  );
}

function LabResultTable({ result }: { result: LabQueryResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60">
      <table className="min-w-full text-left text-xs" aria-label="Query result">
        <caption className="sr-only">
          Query result, {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
          {result.truncated ? ", truncated" : ""}
        </caption>
        <thead>
          <tr className="border-b border-[var(--ink-border)] bg-[var(--panel-2)]">
            {result.columns.map((col) => (
              <th key={col} scope="col" className="px-3 py-2 font-semibold text-[var(--ink-fg)]">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.length ? (
            result.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-[var(--ink-border)] last:border-0">
                {row.map((cell, ci) => (
                  <td key={`${ri}-${ci}`} className="px-3 py-1.5 font-mono text-[var(--ink-fg)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-2 text-[var(--muted)]" colSpan={Math.max(result.columns.length, 1)}>
                No rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-[var(--muted)]">
        {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
        {result.truncated ? " · showing first 50" : ""}
      </p>
    </div>
  );
}
