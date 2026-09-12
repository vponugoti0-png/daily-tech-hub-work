"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FlaskConical, Lightbulb, Play, RotateCcw, Table2 } from "lucide-react";
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
import type { LabPythonResult, LabPythonVfsWrite } from "@/lib/lab/pyodide-client";
import { vfsFilesForLesson, type LabVfsFile } from "@/lib/lab/python-vfs";

const MAIN_TAB = "main.py";

const FAILED_HINT_AFTER = 1;

export function LocalPracticeLab({ track, slug }: { track: string; slug: string }) {
  const python = isPythonLabLesson(track, slug);
  const samples = useMemo(() => samplesForLesson(slug), [slug]);
  const schema = useMemo(() => schemaForTrack(track), [track]);
  const vfsFiles = useMemo(() => (python ? vfsFilesForLesson(slug) : []), [python, slug]);
  const titleId = useId();
  const [sampleId, setSampleId] = useState(samples[0]?.id ?? "");
  const [source, setSource] = useState(samples[0] ? sampleSource(samples[0]) : "");
  const [vfsEdits, setVfsEdits] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(MAIN_TAB);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlResult, setSqlResult] = useState<LabQueryResult | null>(null);
  const [pythonResult, setPythonResult] = useState<LabPythonResult | null>(null);
  const [labSaved, setLabSaved] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(MAIN_TAB);
    setVfsEdits({});
  }, [slug]);

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
    setActiveTab(MAIN_TAB);
    setError(null);
    setFailCount(0);
    setShowHint(false);
    setRestoreStatus(null);
  }

  function markFailed() {
    setFailCount((n) => {
      const next = n + 1;
      if (next >= FAILED_HINT_AFTER) setShowHint(true);
      return next;
    });
  }

  function vfsContents(file: LabVfsFile): string {
    return vfsEdits[file.path] ?? file.contents;
  }

  function overlayFiles(): LabPythonVfsWrite[] {
    return vfsFiles.map((file) => ({ path: file.path, contents: vfsContents(file) }));
  }

  async function runSource(nextSource: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setRestoreStatus(null);
    try {
      if (python) {
        const { runLabPython } = await import("@/lib/lab/pyodide-client");
        const next = await runLabPython(nextSource, overlayFiles());
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
      setFailCount(0);
      window.dispatchEvent(new Event("dth-progress"));
    } catch (err) {
      setSqlResult(null);
      setPythonResult(null);
      setError(err instanceof Error ? err.message : "The local lab could not run that sample.");
      markFailed();
    } finally {
      setBusy(false);
    }
  }

  async function restoreSampleDb() {
    if (busy || python) return;
    setBusy(true);
    setError(null);
    try {
      const { restoreLabDb } = await import("@/lib/lab/duckdb-client");
      await restoreLabDb();
      setSqlResult(null);
      setPythonResult(null);
      setRestoreStatus("Sample database restored.");
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
      setActiveTab(MAIN_TAB);
      const match = samples.find((s) => sampleSource(s).trim() === code.trim());
      if (match) setSampleId(match.id);
      void runSource(code);
    }
    window.addEventListener(TRYIT_RUN_EVENT, onTryIt);
    return () => window.removeEventListener(TRYIT_RUN_EVENT, onTryIt);
    // Intentionally omit runSource — listener always reads latest samples/python via closure refresh on slug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [python, samples, busy, vfsFiles, vfsEdits]);

  const current = samples.find((s) => s.id === sampleId);
  const activeFile = vfsFiles.find((file) => file.path === activeTab);
  const editorValue = activeFile ? vfsContents(activeFile) : source;
  const engineLabel = python ? "Pyodide · in-browser" : "DuckDB · in-browser";
  const honest = python
    ? "Not a live Databricks / cloud Python kernel. Samples run locally in your browser — no shell, no network, no credentials. Practice files live under /data/ (CSV/JSON) in this page's VFS."
    : track === "snowflake"
      ? "Not a live Snowflake account. SQL samples run locally in your browser — no cloud credentials, no shell."
      : track === "sql"
        ? "Not a live warehouse. SQL samples run locally in your browser — no cloud credentials, no shell."
        : "Not a live Databricks workspace. SQL samples run locally in your browser — no cloud credentials, no shell.";
  const hintText = labHint(current, python);

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

      <div className={schema.length ? "lg:grid lg:grid-cols-[minmax(13rem,16rem)_1fr]" : ""}>
        {schema.length ? <LabSchemaSidebar tables={schema} /> : null}

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
                className="btn-primary shrink-0"
                onClick={() => void runSource(source)}
                disabled={busy}
                aria-label={python ? "Run Python sample" : "Run SQL sample"}
                aria-busy={busy}
              >
                <Play className="h-4 w-4" aria-hidden />
                {busy ? "Running…" : "Run sample"}
              </button>
              {python ? null : (
                <button
                  type="button"
                  className="btn-ghost shrink-0"
                  onClick={() => void restoreSampleDb()}
                  disabled={busy}
                  aria-label="Restore sample database"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Restore sample DB
                </button>
              )}
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
          </div>

          {python ? (
            <div role="region" aria-label="Lab files">
              <p className="text-xs font-semibold text-[var(--ink-fg)]">Files</p>
              <div
                role="tablist"
                aria-label="Lab files"
                className="mt-1 flex flex-wrap gap-1"
              >
                <FileTab
                  selected={activeTab === MAIN_TAB}
                  label={MAIN_TAB}
                  onSelect={() => setActiveTab(MAIN_TAB)}
                />
                {vfsFiles.map((file) => (
                  <FileTab
                    key={file.path}
                    selected={activeTab === file.path}
                    label={file.label}
                    path={file.path}
                    onSelect={() => setActiveTab(file.path)}
                  />
                ))}
              </div>
              {activeFile ? (
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Seeded VFS · <span className="font-mono">{activeFile.path}</span> — written before
                  Run. Open it from main.py.
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  main.py is what Run executes. Data tabs are the /data files in this browser.
                </p>
              )}
            </div>
          ) : null}

          <label className="block text-xs font-semibold text-[var(--ink-fg)]">
            {python
              ? activeFile
                ? `${activeFile.label} (VFS)`
                : "Python to run"
              : "SQL to run"}
            <textarea
              className="field mt-1 min-h-[140px] w-full resize-y font-mono text-[12px] leading-relaxed"
              value={python ? editorValue : source}
              spellCheck={false}
              aria-label={
                python
                  ? activeFile
                    ? `Lab file ${activeFile.label}`
                    : "Python to run"
                  : "SQL to run"
              }
              onChange={(e) => {
                const next = e.target.value;
                if (python && activeFile) {
                  setVfsEdits((prev) => ({ ...prev, [activeFile.path]: next }));
                } else {
                  setSource(next);
                }
              }}
            />
          </label>
          {current?.note && (!python || activeTab === MAIN_TAB) ? (
            <p className="text-xs text-[var(--muted)]">{current.note}</p>
          ) : null}

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
    : "Check table and column names in the schema sidebar. This lab only runs SELECT / WITH against the sample database.";
}

function LabSchemaSidebar({ tables }: { tables: LabSchemaTable[] }) {
  return (
    <aside
      aria-label="Sample database schema"
      className="border-b border-[var(--ink-border)] bg-[var(--panel-2)]/70 px-3 py-3 lg:border-b-0 lg:border-r"
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Table2 className="h-3.5 w-3.5 text-[var(--sky)]" aria-hidden />
        <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-fg)]">
          Sample schema
        </h3>
      </div>
      <p className="mb-2 text-[11px] text-[var(--muted)]">
        Seed tables and columns. Local sample DB — not a live catalog.
      </p>
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

function FileTab({
  selected,
  label,
  path,
  onSelect,
}: {
  selected: boolean;
  label: string;
  path?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      data-lab-file={path ?? MAIN_TAB}
      className={
        selected
          ? "rounded-lg border border-[var(--coral)]/40 bg-[var(--coral)]/15 px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--ink-fg)]"
          : "rounded-lg border border-[var(--ink-border)] bg-[var(--panel-2)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink-fg)]"
      }
      onClick={onSelect}
    >
      {label}
    </button>
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
