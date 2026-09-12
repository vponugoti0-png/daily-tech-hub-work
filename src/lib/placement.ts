import type { PlacementLanding } from "@/lib/progress";
import { ZERO_TO_HERO_LEVELS, type ZeroToHeroLevel } from "@/lib/learner-paths";

/**
 * Prompt E skip-ahead items — copied from existing Aurora lesson quizzes.
 * Non-executing MCQs. Wrong answer lands at the named level.
 */
export type PlacementQuestion = {
  id: string;
  topic: string;
  failLevel: Exclude<PlacementLanding, "L7">;
  sourceTrack: string;
  sourceSlug: string;
  question: string;
  options: string[];
  answer: number;
};

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "where-filter",
    topic: "WHERE Filter",
    failLevel: "L1",
    sourceTrack: "sql",
    sourceSlug: "sql-select-filter-nulls",
    question:
      "You need every paid aurora_orders row, including rows whose promo_code is unknown. Which predicate is safe?",
    options: [
      "WHERE promo_code = NULL",
      "WHERE promo_code IS NULL OR promo_code IS NOT NULL — and also status = 'paid'",
      "WHERE status = 'paid'",
      "WHERE DISTINCT promo_code",
    ],
    answer: 2,
  },
  {
    id: "python-exceptions",
    topic: "Python Exception Handling",
    failLevel: "L2",
    sourceTrack: "python",
    sourceSlug: "python-exceptions-retries",
    question: "Why is `except Exception: pass` a pipeline smell?",
    options: [
      "It is slower than a bare except",
      "It turns a broken landing into a successful empty window",
      "Python forbids Exception",
      "It prints too much",
    ],
    answer: 1,
  },
  {
    id: "staging-merge",
    topic: "Staging & Incremental MERGE",
    failLevel: "L3",
    sourceTrack: "sql",
    sourceSlug: "sql-staging-mart-etl",
    question: "Why land into staging instead of MERGEing raw → mart in one statement?",
    options: [
      "So you can inspect, dedupe, and gate before publish",
      "Because staging is billed less",
      "To skip incremental filters",
      "To disable Time Travel",
    ],
    answer: 0,
  },
  {
    id: "copy-into-stage",
    topic: "COPY INTO Stage",
    failLevel: "L4",
    sourceTrack: "snowflake",
    sourceSlug: "sf-copy-stages-ingestion",
    question: "COPY INTO is best used to…",
    options: [
      "Replace Dynamic Tables",
      "Land files from a stage into a table",
      "Train a Cortex model",
      "Clone a database",
    ],
    answer: 1,
  },
  {
    id: "delta-merge-medallion",
    topic: "Delta MERGE Medallion",
    failLevel: "L5",
    sourceTrack: "databricks",
    sourceSlug: "dbx-medallion-etl-builder",
    question: "Autoloader bronze → MERGE silver → DQ → gold is ordered that way because…",
    options: [
      "Gold must run first",
      "You never persist a mart from unvalidated silver",
      "MERGE cannot run on silver",
      "Autoloader writes gold directly",
    ],
    answer: 1,
  },
  {
    id: "mart-data-quality",
    topic: "Mart & Data Quality",
    failLevel: "L6",
    sourceTrack: "sql",
    sourceSlug: "sql-data-quality",
    question: "When should a DQ gate block the MERGE?",
    options: [
      "Never — gold should always update",
      "When a named contract breaks (NULL amounts on paid, dup keys, fan-out)",
      "When the dashboard is ugly",
      "Only on weekends",
    ],
    answer: 1,
  },
];

/** First miss → that question's fail level. All six pass → L7. */
export function landingAfterAnswer(
  questionIndex: number,
  optionIndex: number,
): PlacementLanding | null {
  const question = PLACEMENT_QUESTIONS[questionIndex];
  if (!question) return null;
  if (optionIndex !== question.answer) return question.failLevel;
  if (questionIndex >= PLACEMENT_QUESTIONS.length - 1) return "L7";
  return null;
}

export function landingLevelMeta(id: PlacementLanding): ZeroToHeroLevel {
  return ZERO_TO_HERO_LEVELS.find((level) => level.id === id) ?? ZERO_TO_HERO_LEVELS[1];
}
