"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { upsertLessonProgress } from "@/lib/progress";

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

  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  }, [submitted, answers, questions]);

  if (!questions.length) return null;

  return (
    <section id="quiz" className="panel mt-10 scroll-mt-24 rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-[var(--ink-fg)]">Check your understanding</h2>
      <p className="mt-1 text-sm text-zinc-400">Pick an answer for each question.</p>
      <div className="mt-5 space-y-6">
        {questions.map((q, qi) => (
          <fieldset key={qi} className="space-y-2">
            <legend className="text-sm font-medium text-zinc-100">
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
                      "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                      selected ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/10 bg-white/[0.02]",
                      correct && "border-emerald-500/50 bg-emerald-500/10",
                      wrong && "border-rose-500/50 bg-rose-500/10",
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
                    <span className="text-zinc-300">{opt}</span>
                  </label>
                );
              })}
            </div>
            {submitted && q.explanation ? (
              <p className="text-xs text-zinc-400">{q.explanation}</p>
            ) : null}
          </fieldset>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <>
            <button
              type="button"
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={Object.keys(answers).length < questions.length}
              aria-disabled={Object.keys(answers).length < questions.length}
              title={
                Object.keys(answers).length < questions.length
                  ? `Answer all questions first (${Object.keys(answers).length}/${questions.length})`
                  : "Submit answers"
              }
              onClick={() => {
                setSubmitted(true);
                const s = questions.reduce(
                  (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
                  0,
                );
                upsertLessonProgress(track, slug, {
                  quizScore: s,
                  quizTotal: questions.length,
                });
              }}
            >
              Submit answers
            </button>
            {Object.keys(answers).length < questions.length ? (
              <p className="text-sm font-medium text-[var(--sun)]" role="status">
                Answer all questions to enable submit ({Object.keys(answers).length}/
                {questions.length}).
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm font-bold text-[var(--mint)]">
            Score: {score}/{questions.length}
          </p>
        )}
      </div>
    </section>
  );
}
