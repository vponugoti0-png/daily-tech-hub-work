/** Brand-new learner entry: Prompt Engineering lesson 1. */
export const FIRST_LESSON_TRACK = "prompt-engineering";
export const FIRST_LESSON_SLUG = "pe-ask-better-questions";
export const FIRST_LESSON_HREF = `/training/${FIRST_LESSON_TRACK}/${FIRST_LESSON_SLUG}`;

/** In-page Practice CTA (not a header nav item). */
export const STARTER_PRACTICE_HREF = "/training/sql/sql-select-filter-nulls#lab";

export function firstLessonHref(): string {
  return FIRST_LESSON_HREF;
}
