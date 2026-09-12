import type { QuizQuestion } from "@/lib/types";

/** Plain-English why-wrong copy. Never “the answer is B”. */
export function whyWrongCopy(question: QuizQuestion, selected: number): string {
  if (question.explanation?.trim()) return question.explanation.trim();
  const picked = question.options[selected];
  const correct = question.options[question.answer];
  if (picked && correct) {
    return `“${picked}” is not the best fit. A stronger choice is “${correct}” — it matches what this lesson asked for.`;
  }
  if (correct) {
    return `Not quite. A stronger choice is “${correct}” — it matches what this lesson asked for.`;
  }
  return "Not quite. Re-read the question and pick the option that matches the lesson.";
}

/** Short positive cheer when the pick is right. */
export function cheerCopy(question: QuizQuestion): string {
  if (question.explanation?.trim()) return question.explanation.trim();
  return "Nice — that matches the lesson.";
}
