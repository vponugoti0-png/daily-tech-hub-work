/**
 * Shape checks for lesson_progress track/slug (and merge keys `track:slug`).
 * Unknown track IDs are allowed — content adds tracks often.
 */

export const PROGRESS_TRACK_MAX_LEN = 64;
export const PROGRESS_SLUG_MAX_LEN = 128;

/** Alphanumeric start; then kebab / snake / dot. Rejects empty, spaces, slashes, controls. */
const PROGRESS_PART_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isValidProgressPart(value: string, maxLen: number): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLen &&
    PROGRESS_PART_RE.test(value)
  );
}

export function isValidProgressIds(track: unknown, slug: unknown): boolean {
  return (
    typeof track === "string" &&
    typeof slug === "string" &&
    isValidProgressPart(track, PROGRESS_TRACK_MAX_LEN) &&
    isValidProgressPart(slug, PROGRESS_SLUG_MAX_LEN)
  );
}

/** Split a merge map key (`track:slug`). Slug may not contain `:`. */
export function splitProgressMergeKey(
  key: string,
): { track: string; slug: string } | null {
  if (typeof key !== "string") return null;
  const idx = key.indexOf(":");
  if (idx <= 0 || idx === key.length - 1) return null;
  const track = key.slice(0, idx);
  const slug = key.slice(idx + 1);
  if (!isValidProgressIds(track, slug)) return null;
  return { track, slug };
}

export function assertProgressIds(track: unknown, slug: unknown): {
  track: string;
  slug: string;
} {
  if (!isValidProgressIds(track, slug)) {
    throw new Error("Invalid track or slug");
  }
  return { track: track as string, slug: slug as string };
}
