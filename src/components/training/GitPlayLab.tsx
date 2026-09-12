"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { GitBranch, Play, RotateCcw, Terminal } from "lucide-react";
import { getLessonProgress, upsertLessonProgress } from "@/lib/progress";
import { LAB_STEP_INDEX } from "@/lib/lab/samples";
import { cloneRepo, runCommand } from "@/lib/git-lab/engine";
import { allGoalsPassed, evaluateGoals, headName } from "@/lib/git-lab/goals";
import { defaultLevelId, getGitLevel, levelsForLesson } from "@/lib/git-lab/levels";
import type { RepoState } from "@/lib/git-lab/types";
import { GitCommitTree } from "./GitCommitTree";

interface LogLine {
  kind: "in" | "out" | "err";
  text: string;
}

export function GitPlayLab({ track, slug }: { track: string; slug: string }) {
  const levels = useMemo(() => levelsForLesson(slug), [slug]);
  const titleId = useId();
  const inputId = useId();
  const [levelId, setLevelId] = useIdState(slug, levels[0]?.id);
  const level = getGitLevel(levelId) ?? levels[0];
  const [repo, setRepo] = useState<RepoState>(() => cloneRepo(level.start));
  const [command, setCommand] = useState("");
  const [log, setLog] = useState<LogLine[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [passed, setPassed] = useState(false);
  const [labSaved, setLabSaved] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => {
      setLabSaved((getLessonProgress(track, slug)?.stepIndex ?? 0) >= LAB_STEP_INDEX);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [track, slug]);

  useEffect(() => {
    setRepo(cloneRepo(level.start));
    setLog([]);
    setHintOpen(false);
    setPassed(false);
    setCommand("");
  }, [level]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const goals = evaluateGoals(repo, level.checks);

  function recordPass() {
    upsertLessonProgress(track, slug, { stepIndex: LAB_STEP_INDEX });
    setLabSaved(true);
    setPassed(true);
    window.dispatchEvent(new Event("dth-progress"));
  }

  function applyLine(raw: string) {
    const line = raw.trim();
    if (!line) return;
    if (line.toLowerCase() === "clear") {
      setLog([]);
      return;
    }
    const result = runCommand(repo, line);
    const nextLog: LogLine[] = [
      ...log,
      { kind: "in", text: `$ ${line}` },
      {
        kind: result.ok ? "out" : "err",
        text: result.output || (result.ok ? "" : "Command failed."),
      },
    ];
    setLog(nextLog.filter((l) => l.text));
    setRepo(result.state);
    if (!passed && allGoalsPassed(result.state, level.checks)) {
      recordPass();
    }
  }

  function handleRun() {
    applyLine(command);
    setCommand("");
    inputRef.current?.focus();
  }

  function handleReset() {
    setRepo(cloneRepo(level.start));
    setLog([]);
    setPassed(false);
    setHintOpen(false);
    setCommand("");
    inputRef.current?.focus();
  }

  return (
    <section
      id="lab"
      aria-labelledby={titleId}
      className="tryit lab-surface my-6 scroll-mt-24 overflow-hidden rounded-2xl border border-[var(--ink-border)] bg-[var(--panel)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ink-border)] bg-[var(--panel-2)] px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-[var(--coral)]" aria-hidden />
          <h2
            id={titleId}
            className="font-display text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-fg)]"
          >
            Git Play Lab
          </h2>
          <span className="rounded-md bg-[var(--sky)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--sky)]">
            In-browser model
          </span>
          <span className="rounded-full border border-[var(--mint)]/40 bg-[var(--mint)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--mint)]">
            Product A · no VM
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
          Not a real git repo and not a Practice VM. Commands run in this page against a fake
          commit graph — no shell, no credentials, no push to the public internet.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-xs font-semibold text-[var(--ink-fg)]">
            Level
            <select
              className="field mt-1 w-full text-sm"
              value={level.id}
              aria-label="Git Play Lab level"
              onChange={(e) => setLevelId(e.target.value)}
            >
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} · {l.topic}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-ghost shrink-0" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset level
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--ink-fg)]">{level.blurb}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{level.why}</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <GitCommitTree state={repo} title="Your tree" />
          <GitCommitTree state={level.goalPreview} title="Goal tree" compact />
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            Level goals
          </p>
          <ul className="space-y-1" aria-label="Level goals">
            {goals.map((g) => (
              <li
                key={g.label}
                className={`flex items-start gap-2 rounded-lg px-2 py-1 text-sm ${
                  g.passed ? "text-[var(--mint)]" : "text-[var(--ink-fg)]"
                }`}
              >
                <span aria-hidden>{g.passed ? "✓" : "○"}</span>
                {g.label}
              </li>
            ))}
          </ul>
        </div>

        {passed ? (
          <p
            className="celebrate-pop rounded-xl border border-[var(--mint)]/40 bg-[var(--mint)]/10 px-3 py-2 text-sm font-bold text-[var(--mint)]"
            role="status"
            aria-live="polite"
          >
            Goal passed — {level.title}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-[var(--ink-border)] bg-[#1a1430] text-[#f3efff]">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffe08a]">
              <Terminal className="h-3.5 w-3.5" aria-hidden />
              Sandbox CLI
            </span>
            <span className="font-mono text-[10px] text-white/60">{headName(repo)}</span>
          </div>
          <div
            ref={logRef}
            className="max-h-40 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed"
            aria-label="Command output"
          >
            {log.length ? (
              log.map((line, i) => (
                <pre
                  key={`${i}-${line.kind}`}
                  className={
                    line.kind === "in"
                      ? "text-[#6ed4f5]"
                      : line.kind === "err"
                        ? "text-[#ff8a6e] whitespace-pre-wrap"
                        : "text-[#f3efff] whitespace-pre-wrap"
                  }
                >
                  {line.text}
                </pre>
              ))
            ) : (
              <p className="text-white/50">Type a git command. Try help if you want the verb list.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 border-t border-white/10 p-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor={inputId}>
              Git command
            </label>
            <input
              ref={inputRef}
              id={inputId}
              className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 font-mono text-sm text-[#f3efff] outline-none focus:border-[#ff8a6e]"
              value={command}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder='git commit -m "feat(marts): add orders_daily grain"'
              aria-label="Git command"
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRun();
                }
              }}
            />
            <button
              type="button"
              className="btn-primary shrink-0"
              onClick={handleRun}
              aria-label="Run command"
            >
              <Play className="h-4 w-4" aria-hidden />
              Run
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-[40px] items-center rounded-lg border border-[var(--ink-border)] bg-[var(--panel)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]"
            aria-expanded={hintOpen}
            onClick={() => setHintOpen(true)}
          >
            Show hint
          </button>
          {hintOpen ? <p className="text-xs font-semibold text-[var(--mint)]">{level.hint}</p> : null}
        </div>
      </div>
    </section>
  );
}

function useIdState(slug: string, fallback?: string): [string, (id: string) => void] {
  const initial = defaultLevelId(slug) || fallback || "commit-mart";
  return useState(initial);
}
