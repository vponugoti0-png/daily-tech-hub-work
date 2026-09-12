"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Lightbulb,
  Play,
  RotateCcw,
  Table2,
  Undo2,
} from "lucide-react";
import { getLessonProgress, upsertLessonProgress } from "@/lib/progress";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";
import {
  LAB_STEP_INDEX,
  isPythonLabLesson,
  samplesForLesson,
  sampleSource,
  type LabSample,
} from "@/lib/lab/samples";
import { schemaForTrack, type LabSchemaTable } from "@/lib/lab/schema";
import { cellText } from "@/lib/lab/render";
import type { LabQueryResult } from "@/lib/lab/duckdb-client";
import type { LabPythonResult } from "@/lib/lab/pyodide-client";

const FAILED_HINT_AFTER = 1;

/** Unified Tryit desk for lesson `#lab` and `/practice`. */
export function LocalPracticeLab({ track, slug }: { track: string; slug: string }) {
  const python = isPythonLabLesson(track, slug);
  const samples = useMemo(() => samplesForLesson(slug), [slug]);
  const schema = useMemo(() => (python ? [] : schemaForTrack(track)), [python, track]);
  const titleId = useId();
  const [sampleId, setSampleId] = useState(samples[0]?.id ?? "");
  const [source, setSource] = useState(samples[0] ? sampleSource(samples[0]) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlResult, setSqlResult] = useState<LabQueryResult | null>(null);
  const [pythonResult, setPythonResult] = useState<LabPythonResult | null>(null);
  const [labSaved, setLabSaved] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const first = samples[0];
    setSampleId(first?.id ?? "");
    setSource(first ? sampleSource(first) : "");
    setError(null);
    setSqlResult(null);
    setPythonResult(null);
    setFailCount(0);
    setShowHint(false);
    setRestoreStatus(null);
    setHasRun(false);
  }, [track, slug, samples]);

  useEffect(() => {
    const refresh = () => {
      setLabSaved((getLessonProgress(track, slug)?.stepIndex ?? 0) >= LAB_STEP_INDEX);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [track, slug]);

  function clearOutput() {
    setSqlResult(null);
    setPythonResult(null);
    setError(null);
    setHasRun(false);
  }

  function applySample(next: LabSample) {
    setSampleId(next.id);
    setSource(sampleSource(next));
    setFailCount(0);
    setShowHint(false);
    setRestoreStatus(null);
    clearOutput();
  }

  function resetStatement() {
    const current = samples.find((s) => s.id === sampleId) ?? samples[0];
    if (!current) return;
    setSource(sampleSource(current));
    setRestoreStatus(null);
    setError(null);
  }

  function stepSample(delta: number) {
    if (!samples.length) return;
    const idx = Math.max(0, samples.findIndex((s) => s.id === sampleId));
    const next = samples[(idx + delta + samples.length) % samples.length];
    if (next) applySample(next);
  }

  function markFailed() {
    setFailCount((n) => {
      const next = n + 1;
      if (next >= FAILED_HINT_AFTER) setShowHint(true);
      return next;
    });
  }

  async function runSource(nextSource: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setRestoreStatus(null);
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
      setHasRun(true);
      upsertLessonProgress(track, slug, { stepIndex: LAB_STEP_INDEX });
      setLabSaved(true);
      setFailCount(0);
      window.dispatchEvent(new Event("dth-progress"));
    } catch (err) {
      setSqlResult(null);
      setPythonResult(null);
      setHasRun(true);
      setError(err instanceof Error ? err.message : "The local lab could not run that sample.");
      markFailed();
    } finally {
      setBusy(false);
    }
  }

  async function restoreSampleDb() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (python) {
        const { restoreLabPython } = await import("@/lib/lab/pyodide-client");
        await restoreLabPython();
        setRestoreStatus("Sample files restored.");
      } else {
        const { restoreLabDb } = await import("@/lib/lab/duckdb-client");
        await restoreLabDb();
        setRestoreStatus("Sample database restored.");
      }
      setSqlResult(null);
      setPythonResult(null);
      setHasRun(false);
    } catch (err) {
      setRestoreStatus(null);
      setError(err instanceof Error ? err.message : "Could not restore the sample database.");
      markFailed();
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
      setRestoreStatus(null);
      setFailCount(0);
      setShowHint(false);
      setSqlResult(null);
      setPythonResult(null);
      setError(null);
      setHasRun(false);
    }
    window.addEventListener(TRYIT_RUN_EVENT, onTryIt);
    return () => window.removeEventListener(TRYIT_RUN_EVENT, onTryIt);
  }, [samples]);

  const current = samples.find((s) => s.id === sampleId);
  const sampleIndex = Math.max(0, samples.findIndex((s) => s.id === sampleId));
  const engineLabel = python ? "Pyodide · in-browser" : "DuckDB · in-browser";
  const honest = python
    ? "Not a live Databricks / cloud Python kernel. Samples run locally in your browser — no shell, no network, no credentials."
    : track === "snowflake"
      ? "Not a live Snowflake account. SQL samples run locally in your browser — no cloud credentials, no shell."
      : track === "sql"
        ? "Not a live warehouse. SQL samples run locally in your browser — no cloud credentials, no shell."
        : "Not a live Databricks workspace. SQL samples run locally in your browser — no cloud credentials, no shell.";
  const hintText = labHint(current, python);
  const showEmpty = !hasRun && !sqlResult && !pythonResult && !error;

  return (
    <section
      id="lab"
      data-testid="unified-tryit"
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

      <div className={schema.length ? "lg:grid lg:grid-cols-[minmax(13rem,16rem)_1fr]" : ""}>
        {schema.length ? <LabSchemaSidebar tables={schema} track={track} /> : null}

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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost shrink-0"
                onClick={() => stepSample(-1)}
                disabled={busy || samples.length < 2}
                aria-label="Previous sample"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Prev
              </button>
              <button
                type="button"
                className="btn-ghost shrink-0"
                onClick={() => stepSample(1)}
                disabled={busy || samples.length < 2}
                aria-label="Next sample"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
          {samples.length > 1 ? (
            <p className="text-[11px] text-[var(--muted)]">
              Sample {sampleIndex + 1} of {samples.length}
            </p>
          ) : null}

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              className="btn-primary h-11 min-h-[44px] shrink-0"
              onClick={() => void runSource(source)}
              disabled={busy}
              aria-label={python ? "Run Python sample" : "Run SQL sample"}
              aria-busy={busy}
            >
              <Play className="h-4 w-4" aria-hidden />
              {busy ? "Running…" : "Run"}
            </button>
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={() => void restoreSampleDb()}
              disabled={busy}
              aria-label="Restore sample database"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Restore
            </button>
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={resetStatement}
              disabled={busy}
              aria-label="Reset statement"
            >
              <Undo2 className="h-4 w-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={() => setShowHint((open) => !open)}
              aria-expanded={showHint}
              aria-label={showHint ? "Hide hint" : "Show hint"}
            >
              <Lightbulb className="h-4 w-4" aria-hidden />
              {showHint ? "Hide hint" : "Hint"}
            </button>
          </div>

          <label className="block text-xs font-semibold text-[var(--ink-fg)]">
            {python ? "Python to run" : "SQL Statement"}
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

          {restoreStatus ? (
            <p className="text-sm font-semibold text-[var(--mint)]" role="status">
              {restoreStatus}
            </p>
          ) : null}

          {error ? (
            <p
              className="rounded-xl border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-3 py-2 text-sm text-[var(--ink-fg)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {showHint ? (
            <p
              className="rounded-xl border border-[var(--sun)]/35 bg-[var(--sun)]/15 px-3 py-2 text-sm text-[var(--ink-fg)]"
              data-testid="lab-hint"
            >
              {failCount >= FAILED_HINT_AFTER
                ? `After that failed run: ${hintText}`
                : hintText}
            </p>
          ) : null}

          {showEmpty ? (
            <p
              className="rounded-xl border border-dashed border-[var(--ink-border)] bg-[var(--canvas)]/40 px-3 py-4 text-sm text-[var(--muted)]"
              data-testid="lab-empty"
            >
              {python
                ? "Press Run to execute the sample."
                : "Press Run to query the sample DB"}
            </p>
          ) : null}

          {sqlResult ? <LabResultTable result={sqlResult} /> : null}
          {pythonResult ? <PythonResult result={pythonResult} /> : null}
        </div>
      </div>
    </section>
  );
}

function labHint(sample: LabSample | undefined, python: boolean): string {
  if (sample?.note) return sample.note;
  return python
    ? "Samples run in-browser with the Python standard library. Check names in the sample — there is no warehouse schema."
    : "Check table and column names in Your database. This lab only runs SELECT / WITH against the sample database.";
}

function schemaSubtitle(track: string): string {
  if (track === "snowflake") return "local DuckDB seed, not a warehouse";
  if (track === "databricks") return "local DuckDB seed, not a cluster";
  return "local DuckDB seed, not a warehouse";
}

function LabSchemaSidebar({ tables, track }: { tables: LabSchemaTable[]; track: string }) {
  return (
    <aside
      aria-label="Your database"
      className="border-b border-[var(--ink-border)] bg-[var(--panel-2)]/70 px-3 py-3 lg:border-b-0 lg:border-r"
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Table2 className="h-3.5 w-3.5 text-[var(--sky)]" aria-hidden />
        <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-fg)]">
          Your database
        </h3>
      </div>
      <p className="mb-2 text-[11px] text-[var(--muted)]">{schemaSubtitle(track)}</p>
      <ul className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
        {tables.map((table, index) => (
          <li key={table.name}>
            <details open={index < 2} className="rounded-lg border border-[var(--ink-border)] bg-[var(--panel)]">
              <summary className="cursor-pointer px-2 py-1.5 text-xs font-semibold text-[var(--ink-fg)]">
                <span data-testid={`lab-schema-table-${table.name}`}>{table.name}</span>
                <span className="ml-1 font-normal text-[var(--muted)]">
                  {table.kind === "view" ? "view" : table.schema}
                </span>
              </summary>
              <ul className="border-t border-[var(--ink-border)] px-2 py-1.5">
                {table.columns.map((col) => (
                  <li
                    key={`${table.name}.${col.name}`}
                    className="flex justify-between gap-2 font-mono text-[11px] text-[var(--ink-fg)]"
                  >
                    <span>{col.name}</span>
                    <span className="text-[var(--muted)]">{col.type}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PythonResult({ result }: { result: LabPythonResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60">
      <pre
        className="whitespace-pre-wrap px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]"
        aria-label="Python result"
        data-testid="lab-python-stdout"
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
                    {cellText(cell)}
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
