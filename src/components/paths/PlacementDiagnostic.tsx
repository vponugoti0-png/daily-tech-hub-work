"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { landingAfterAnswer, landingLevelMeta, PLACEMENT_QUESTIONS } from "@/lib/placement";
import {
  ZERO_TO_HERO_LEVELS,
  type PathLevelId,
} from "@/lib/learner-paths";
import {
  clearPlacement,
  loadPlacement,
  savePlacement,
  type PlacementLanding,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

function notifyProgress() {
  window.dispatchEvent(new Event("dth-progress"));
}

export function PlacementDiagnostic() {
  const [index, setIndex] = useState(0);
  const [landing, setLanding] = useState<PlacementLanding | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setLanding(loadPlacement()?.landingLevel ?? null);
      setReady(true);
    };
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, []);

  function choose(optionIndex: number) {
    const nextLanding = landingAfterAnswer(index, optionIndex);
    if (nextLanding) {
      savePlacement(nextLanding);
      setLanding(nextLanding);
      notifyProgress();
      return;
    }
    setIndex((i) => i + 1);
  }

  function retake() {
    clearPlacement();
    setLanding(null);
    setIndex(0);
    notifyProgress();
  }

  if (!ready) {
    return (
      <section
        id="placement"
        data-testid="placement-diagnostic"
        className="panel scroll-mt-24 rounded-3xl p-5"
      >
        <p className="text-sm text-[var(--muted)]">Loading placement…</p>
      </section>
    );
  }

  if (landing) {
    const level = landingLevelMeta(landing);
    return (
      <section
        id="placement"
        data-testid="placement-diagnostic"
        className="panel scroll-mt-24 rounded-3xl p-5"
        aria-labelledby="placement-heading"
      >
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sun)]">
          Skip ahead
        </p>
        <h2
          id="placement-heading"
          className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]"
        >
          Start at {level.id} · {level.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          We stopped at the first miss (or finished the set) and suggested a level. This is not
          graded. Open any other level if you want a different door.
        </p>
        <p data-testid="placement-landing" hidden>
          {landing}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={level.href} className="btn-primary inline-flex" data-testid="placement-start">
            {level.hrefLabel} →
          </Link>
          <button type="button" className="btn-ghost" data-testid="placement-retake" onClick={retake}>
            Ask again
          </button>
        </div>
        <div className="mt-5" data-testid="placement-override">
          <p className="text-sm font-medium text-[var(--ink-fg)]">Or pick a different level</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ZERO_TO_HERO_LEVELS.filter((item) => item.id !== "L0").map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  data-testid={`placement-override-${item.id}`}
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold",
                    item.id === landing
                      ? "border-[var(--mint)]/50 bg-[var(--mint)]/10 text-[var(--ink-fg)]"
                      : "border-[var(--ink-border)] text-[var(--ink-fg)] hover:border-[var(--coral)]/40",
                  )}
                >
                  {item.id} · {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const question = PLACEMENT_QUESTIONS[index];

  return (
    <section
      id="placement"
      data-testid="placement-diagnostic"
      className="panel scroll-mt-24 rounded-3xl p-5"
      aria-labelledby="placement-heading"
    >
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sun)]">
        Skip ahead
      </p>
      <h2
        id="placement-heading"
        className="mt-1 font-display text-xl font-bold text-[var(--ink-fg)]"
      >
        Six placement questions
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Aurora lesson checks only. We halt at the first miss and suggest a starting level. This
        is not a graded exam. You can still open any level on this page.
      </p>

      <fieldset className="mt-5 space-y-3" data-testid="placement-question">
        <legend className="text-sm font-medium text-[var(--ink-fg)]">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky)]">
            {question.topic}
          </span>
          <span className="mt-1 block">{question.question}</span>
        </legend>
        <div className="space-y-2">
          {question.options.map((opt, oi) => (
            <button
              key={oi}
              type="button"
              data-testid="placement-option"
              className="flex w-full items-start rounded-xl border border-[var(--ink-border)] bg-[var(--panel)]/70 px-3 py-2.5 text-left text-sm text-[var(--ink-fg)] transition hover:border-[var(--sky)]/45 hover:bg-[var(--sky)]/12"
              onClick={() => choose(oi)}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-4 text-sm text-[var(--muted)]">
        Prefer to choose? The outline below is never locked.
      </p>
    </section>
  );
}

export function usePlacementLanding(): PathLevelId | null {
  const [landing, setLanding] = useState<PathLevelId | null>(null);
  useEffect(() => {
    const refresh = () => setLanding(loadPlacement()?.landingLevel ?? null);
    refresh();
    window.addEventListener("dth-progress", refresh);
    return () => window.removeEventListener("dth-progress", refresh);
  }, []);
  return landing;
}
