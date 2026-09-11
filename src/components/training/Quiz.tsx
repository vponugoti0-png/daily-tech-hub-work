"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { upsertLessonProgress } from "@/lib/progress";

function tallyScore(questions: QuizQuestion[], answers: Record<number, number>) {
  return questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
}

export function Quiz({
  questions,
  track,
  slug,
}: {
  questions: QuizQuestion[];
  track: string;
  slug: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= questions.length;

  const score = useMemo(() => {
    if (!submitted) return 0;
    return tallyScore(questions, answers);
  }, [submitted, answers, questions]);

  function handleSubmit() {
    if (!allAnswered) return;
    const nextScore = tallyScore(questions, answers);
    setSubmitted(true);
    upsertLessonProgress(track, slug, {
      quizScore: nextScore,
      quizTotal: questions.length,
    });
  }

  function handleTryAgain() {
    setAnswers({});
    setSubmitted(false);
  }

  if (!questions.length) return null;

  return (
    <section id="quiz" className="panel mt-10 scroll-mt-24 rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-[var(--ink-fg)]">Check your understanding</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Pick an answer for each question.</p>
      <div className="mt-5 space-y-6">
        {questions.map((q, qi) => (
          <fieldset key={qi} className="space-y-2">
            <legend className="text-sm font-medium text-[var(--ink-fg)]">
              {qi + 1}. {q.question}
            </legend>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const correct = submitted && oi === q.answer;
                const wrong = submitted && selected && oi !== q.answer;
                return (
                  <label
                    key={oi}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                      submitted ? "cursor-default" : "cursor-pointer",
                      selected
                        ? "border-[var(--sky)]/45 bg-[var(--sky)]/12"
                        : "border-[var(--ink-border)] bg-[var(--panel)]/70",
                      correct && "border-[var(--mint)]/50 bg-[var(--mint)]/10",
                      wrong && "border-[var(--coral)]/50 bg-[var(--coral)]/10",
                    )}
                  >
                    <input
                      type="radio"
                      className="mt-1"
                      name={`q-${qi}`}
                      checked={selected}
                      disabled={submitted}
                      onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    />
                    <span className="text-[var(--ink-fg)]">{opt}</span>
                  </label>
                );
              })}
            </div>
            {submitted && q.explanation ? (
              <p className="text-xs text-[var(--muted)]">{q.explanation}</p>
            ) : null}
          </fieldset>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <button
              type="button"
              className="btn-primary disabled:opacity-40"
              disabled={!allAnswered}
              onClick={handleSubmit}
            >
              Submit answers
            </button>
            {!allAnswered ? (
              <p className="text-sm text-[var(--muted)]">
                Answer all questions to enable submit ({answeredCount}/{questions.length}).
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-[var(--mint)]" role="status" aria-live="polite">
              Score: {score}/{questions.length}
            </p>
            <button type="button" className="btn-ghost" onClick={handleTryAgain}>
              Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
