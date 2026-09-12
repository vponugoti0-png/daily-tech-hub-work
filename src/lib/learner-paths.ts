import { labEntrySlug } from "@/lib/lab/samples";

/** Brand-new learner entry: first beginner Prompt Engineering lesson. */
export const FIRST_LESSON_TRACK = "prompt-engineering";
export const FIRST_LESSON_SLUG = "pe-ask-better-questions";
export const FIRST_LESSON_HREF = `/training/${FIRST_LESSON_TRACK}/${FIRST_LESSON_SLUG}`;

/** Hands-on Practice entry Product already stamped (SQL local lab). */
export const STARTER_PRACTICE_TRACK = "sql";
export const STARTER_PRACTICE_SLUG = "sql-select-filter-nulls";
export const STARTER_PRACTICE_HREF = `/training/${STARTER_PRACTICE_TRACK}/${STARTER_PRACTICE_SLUG}#lab`;

export const AGENTS_PRACTICE_HREF = "/training/ai-data-eng/ai-de-practice-agents";

export function firstLessonHref(): string {
  return FIRST_LESSON_HREF;
}

export function practiceCta(track: string): { href: string; label: string } {
  const labSlug = labEntrySlug(track);
  if (labSlug) {
    return { href: `/training/${track}/${labSlug}#lab`, label: "Practice · local lab →" };
  }
  if (track === "prompt-engineering" || track === "ai-data-eng") {
    return { href: AGENTS_PRACTICE_HREF, label: "Practice with agents →" };
  }
  return { href: STARTER_PRACTICE_HREF, label: "Practice · SQL lab →" };
}
