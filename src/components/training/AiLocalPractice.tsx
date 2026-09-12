"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FlaskConical, Play } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { getLessonProgress, upsertLessonProgress } from "@/lib/progress";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";
import { LAB_STEP_INDEX } from "@/lib/lab/samples";
import {
  evaluatePrompt,
  exercisesForLesson,
  matchExercise,
  type AiExercise,
  type AiRubricResult,
} from "@/lib/lab/ai-rubric";

export function AiLocalPractice({ track, slug }: { track: string; slug: string }) {
  const exercises = useMemo(() => exercisesForLesson(slug), [slug]);
  const titleId = useId();
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [source, setSource] = useState(exercises[0]?.starter ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiRubricResult | null>(null);
  const [labSaved, setLabSaved] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setLabSaved((getLessonProgress(track, slug)?.stepIndex ?? 0) >= LAB_STEP_INDEX);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [track, slug]);

  function applyExercise(next: AiExercise) {
    setExerciseId(next.id);
    setSource(next.starter);
    setError(null);
    setResult(null);
  }

  function checkSource(nextSource: string, exercise?: AiExercise) {
    const current = exercise ?? exercises.find((ex) => ex.id === exerciseId) ?? exercises[0];
    if (!current) return;
    setError(null);
    try {
      const next = evaluatePrompt(current, nextSource);
      setResult(next);
      upsertLessonProgress(track, slug, { stepIndex: LAB_STEP_INDEX });
      setLabSaved(true);
      window.dispatchEvent(new Event("dth-progress"));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "This local practice could not check that prompt.");
    }
  }

  useEffect(() => {
    function onTryIt(event: Event) {
      const code = (event as CustomEvent<TryItRunDetail>).detail?.code;
      if (typeof code !== "string") return;
      setSource(code);
      const match = matchExercise(slug, code);
      if (match) setExerciseId(match.id);
      checkSource(code, match);
    }
    window.addEventListener(TRYIT_RUN_EVENT, onTryIt);
    return () => window.removeEventListener(TRYIT_RUN_EVENT, onTryIt);
    // Listener always reads latest exercises via slug refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, exerciseId, exercises]);

  const current = exercises.find((ex) => ex.id === exerciseId) ?? exercises[0];

  return (
    <section
      id="lab"
      data-testid="ai-local-practice"
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
            Local practice
          </h2>
          <span className="rounded-md bg-[var(--sky)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--sky)]">
            Checklist · in-browser
          </span>
        </div>
        {labSaved ? (
          <p className="text-[11px] font-semibold text-[var(--mint)]" role="status">
            Lab step saved on this device
          </p>
        ) : null}
      </div>

      <div className="space-y-3 px-3 py-3">
        <p className="text-sm text-[var(--muted)]">
          Not a live Claude or GPT account. Your prompt is scored locally against this lesson’s
          checklist — no API key, no network, no model download.{" "}
          <strong className="font-semibold text-[var(--ink-fg)]">Copy</strong> stays the fallback
          if you want a real chat later.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-xs font-semibold text-[var(--ink-fg)]">
            Practice prompt
            <select
              className="field mt-1 w-full text-sm"
              value={exerciseId}
              aria-label="Practice prompt"
              onChange={(e) => {
                const next = exercises.find((ex) => ex.id === e.target.value);
                if (next) applyExercise(next);
              }}
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary shrink-0"
              onClick={() => checkSource(source)}
              aria-label="Check prompt against lesson checklist"
            >
              <Play className="h-4 w-4" aria-hidden />
              Check prompt
            </button>
            <CopyButton text={source} label="Copy" />
          </div>
        </div>

        <label className="block text-xs font-semibold text-[var(--ink-fg)]">
          Prompt to check
          <textarea
            className="field mt-1 min-h-[140px] w-full resize-y font-mono text-[12px] leading-relaxed"
            value={source}
            spellCheck={false}
            aria-label="Prompt to check"
            onChange={(e) => setSource(e.target.value)}
          />
        </label>
        {current?.note ? <p className="text-xs text-[var(--muted)]">{current.note}</p> : null}

        {error ? (
          <p
            className="rounded-xl border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-3 py-2 text-sm text-[var(--ink-fg)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {result ? <RubricPanel result={result} /> : null}
      </div>
    </section>
  );
}

function RubricPanel({ result }: { result: AiRubricResult }) {
  return (
    <div data-testid="ai-rubric" className="space-y-3">
      <p
        className={
          result.pass
            ? "text-sm font-semibold text-[var(--mint)]"
            : "text-sm font-semibold text-[var(--ink-fg)]"
        }
        role="status"
      >
        {result.pass
          ? "Checklist met — still review a live model yourself."
          : `Checklist ${result.passed}/${result.total} — edit and check again, or Copy.`}
      </p>
      <ul className="space-y-1.5" aria-label="Prompt checklist">
        {result.items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60 px-3 py-2 text-sm"
          >
            <p className="font-medium text-[var(--ink-fg)]">
              {item.pass ? "Pass — " : "Not yet — "}
              {item.label}
            </p>
            {item.pass ? null : <p className="mt-0.5 text-xs text-[var(--muted)]">{item.hint}</p>}
          </li>
        ))}
      </ul>
      <pre
        className="whitespace-pre-wrap rounded-xl border border-[var(--ink-border)] bg-[var(--canvas)]/60 px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--ink-fg)]"
        aria-label="Practice sketch"
      >
        {result.sketch}
      </pre>
    </div>
  );
}
