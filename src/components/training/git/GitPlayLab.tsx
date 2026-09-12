"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { GitBranch, Play, RotateCcw, Sparkles } from "lucide-react";
import { getLessonProgress, upsertLessonProgress } from "@/lib/progress";
import { TRYIT_RUN_EVENT, type TryItRunDetail } from "@/lib/lab/events";
import { LAB_STEP_INDEX } from "@/lib/lab/samples";
import {
  graphSummary,
  runGitCommand,
  tryHeadCommit,
  type GitRepo,
} from "./engine";
import { GitGraph } from "./GitGraph";
import { defaultLevelId, getLevel, GIT_LEVELS, startLevel, type GitLevel } from "./levels";

function saveLabStep(track: string, slug: string) {
  upsertLessonProgress(track, slug, { stepIndex: LAB_STEP_INDEX });
  window.dispatchEvent(new Event("dth-progress"));
}

export function GitPlayLab({ track, slug }: { track: string; slug: string }) {
  const titleId = useId();
  const inputId = useId();
  const initialId = defaultLevelId(slug);
  const [levelId, setLevelId] = useState(initialId);
  const level = useMemo(() => getLevel(levelId) ?? GIT_LEVELS[0], [levelId]);
  const [repo, setRepo] = useState<GitRepo>(() => startLevel(initialId));
  const [log, setLog] = useState<string[]>(() => [
    "In-browser graph only — no practice VM, no GitHub network.",
    `Level: ${level.title}. Type a command or press a suggested chip.`,
  ]);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [labSaved, setLabSaved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const repoRef = useRef(repo);

  const complete = level.check(repo);

  useEffect(() => {
    repoRef.current = repo;
  }, [repo]);

  useEffect(() => {
    const refresh = () => {
      setLabSaved((getLessonProgress(track, slug)?.stepIndex ?? 0) >= LAB_STEP_INDEX);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, [track, slug]);

  useEffect(() => {
    const next = getLevel(defaultLevelId(slug)) ?? GIT_LEVELS[0];
    applyLevel(next);
  }, [slug]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  useEffect(() => {
    function onTryIt(event: Event) {
      const code = (event as CustomEvent<TryItRunDetail>).detail?.code;
      if (typeof code !== "string") return;
      const lines = code
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) return;
      runLines(lines);
    }
    window.addEventListener(TRYIT_RUN_EVENT, onTryIt);
    return () => window.removeEventListener(TRYIT_RUN_EVENT, onTryIt);
  }, [track, slug]);

  function applyLevel(next: GitLevel) {
    setLevelId(next.id);
    setRepo(startLevel(next.id));
    setShowHint(false);
    setCommand("");
    setHistoryIndex(-1);
    setLog([
      "In-browser graph only — no practice VM, no GitHub network.",
      `Level: ${next.title}. ${next.goal}`,
    ]);
  }

  function runLines(lines: string[]) {
    if (!lines.length) return;
    let current = repoRef.current;
    const appended: string[] = [];
    let anyOk = false;
    for (const line of lines) {
      const result = runGitCommand(current, line);
      current = result.repo;
      appended.push(`$ ${line}`, result.output || (result.ok ? "(ok)" : "Command failed"));
      if (result.ok) anyOk = true;
    }
    repoRef.current = current;
    setRepo(current);
    setLog((prev) => [...prev, ...appended]);
    setHistory((prev) => {
      let next = prev;
      for (const line of lines) {
        next = next[next.length - 1] === line ? next : [...next, line];
      }
      return next;
    });
    setHistoryIndex(-1);
    setCommand("");
    if (anyOk) {
      saveLabStep(track, slug);
      setLabSaved(true);
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function runLine(raw: string) {
    const line = raw.trim();
    if (!line) return;
    runLines([line]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runLine(command);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setCommand(history[next] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < 0) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setCommand("");
      } else {
        setHistoryIndex(next);
        setCommand(history[next] ?? "");
      }
    }
  }

  const refsLine = graphSummary(repo);
  const head = tryHeadCommit(repo);

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
            In-browser · no VM
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
          Visual commit graph + command CLI. Commands mutate this tab only — not a practice VM,
          and not a network push to GitHub.
        </p>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Git Play Lab levels">
          {GIT_LEVELS.map((item) => {
            const active = item.id === level.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  active
                    ? "border-[var(--coral)]/50 bg-[var(--coral)]/15 text-[var(--ink-fg)]"
                    : "border-[var(--ink-border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--ink-fg)]"
                }`}
                onClick={() => applyLevel(item)}
              >
                {item.title}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-[var(--violet)]/30 bg-[var(--violet)]/10 px-3 py-2.5">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--violet)]">
            {level.skill.replaceAll("-", " ")} · DE story
          </p>
          <p className="mt-1 text-sm text-[var(--ink-fg)]">{level.story}</p>
          <p className="mt-2 text-sm font-semibold text-[var(--ink-fg)]">
            Goal: {level.goal}
          </p>
        </div>

        {complete ? (
          <p
            className="celebrate-pop rounded-xl border border-[var(--mint)]/40 bg-[var(--mint)]/15 px-3 py-2 text-sm font-semibold text-[var(--mint)]"
            role="status"
          >
            Goal tree matched. The graph is the proof — then take the quiz.
          </p>
        ) : null}

        <GitGraph repo={repo} />

        <p className="font-mono text-[11px] leading-relaxed text-[var(--muted)]" aria-live="polite">
          {refsLine}
          {head ? ` · tip ${head}` : ""}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {level.suggested.map((chip) => (
            <button
              key={chip}
              type="button"
              className="rounded-lg border border-[var(--ink-border)] bg-[var(--panel-2)] px-2 py-1 font-mono text-[11px] text-[var(--ink-fg)] hover:border-[var(--coral)]/40"
              onClick={() => {
                setCommand(chip);
                inputRef.current?.focus();
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        <div
          ref={logRef}
          className="max-h-40 overflow-y-auto rounded-xl border border-[var(--ink-border)] bg-[#1a1430] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#f0ecff]"
          aria-label="Command output"
        >
          {log.map((line, index) => (
            <p key={`${index}-${line.slice(0, 24)}`} className={line.startsWith("$") ? "text-[var(--sun)]" : ""}>
              {line}
            </p>
          ))}
        </div>

        <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <label className="min-w-0 flex-1 text-xs font-semibold text-[var(--ink-fg)]" htmlFor={inputId}>
            Git command
            <input
              id={inputId}
              ref={inputRef}
              className="field mt-1 w-full font-mono text-sm"
              value={command}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              aria-label="Git command"
              placeholder="git commit -m &quot;feat(marts): …&quot;"
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary shrink-0" aria-label="Run git command">
              <Play className="h-4 w-4" aria-hidden />
              Run command
            </button>
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={() => applyLevel(level)}
              aria-label="Reset level"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={() => setShowHint(true)}
              aria-expanded={showHint}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Hint
            </button>
          </div>
        </form>

        {showHint ? (
          <p className="rounded-xl border border-[var(--sun)]/35 bg-[var(--sun)]/15 px-3 py-2 text-sm text-[var(--ink-fg)]">
            {level.hint}
          </p>
        ) : null}
      </div>
    </section>
  );
}
