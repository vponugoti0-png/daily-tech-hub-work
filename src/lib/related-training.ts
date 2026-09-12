import { getAllLessons, getLessonsByTrack } from "./content";
import { getTrackMeta, TRACK_IDS } from "./tracks";
import type { Topic, TrackId, TrainingLesson } from "./types";

export type RelatedTrainingLink = {
  href: string;
  title: string;
  description: string;
  kind: "lesson" | "track";
  trackId: TrackId;
};

/** Tool tags that have a dedicated /training/[track] index. */
const TOPIC_TO_TRACK: Partial<Record<Topic, TrackId>> = {
  snowflake: "snowflake",
  databricks: "databricks",
  python: "python",
  sql: "sql",
  git: "git",
  // PySpark lives on the Databricks track (no /training/pyspark).
  pyspark: "databricks",
};

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "are",
  "was",
  "you",
  "your",
  "into",
  "when",
  "what",
  "how",
  "why",
  "its",
]);

export function tracksForTopics(topics: readonly Topic[]): TrackId[] {
  const seen = new Set<TrackId>();
  const out: TrackId[] = [];
  for (const topic of topics) {
    const track = TOPIC_TO_TRACK[topic];
    if (!track || seen.has(track) || !TRACK_IDS.includes(track)) continue;
    seen.add(track);
    out.push(track);
  }
  return out;
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

function sharedTopics(lesson: TrainingLesson, topics: readonly Topic[]): Topic[] {
  return lesson.topics.filter((topic) => topics.includes(topic));
}

function scoreLesson(
  lesson: TrainingLesson,
  topics: readonly Topic[],
  title: string,
  mappedTracks: readonly TrackId[],
): number {
  const shared = sharedTopics(lesson, topics);
  if (!shared.length) return -1;

  let score = shared.length * 10;
  if (shared.some((topic) => topic !== "general")) score += 4;
  if (mappedTracks.includes(lesson.track)) score += 8;

  const sourceTokens = tokenize(title);
  const lessonTokens = tokenize(`${lesson.title} ${lesson.slug} ${lesson.description}`);
  let overlap = 0;
  for (const token of sourceTokens) {
    if (lessonTokens.has(token)) overlap += 1;
  }
  score += overlap * 3;
  // Prefer earlier “start here” lessons when scores are close.
  score -= lesson.order * 0.01;
  return score;
}

function trackIndexLink(trackId: TrackId): RelatedTrainingLink | undefined {
  const meta = getTrackMeta(trackId);
  const lessons = getLessonsByTrack(trackId);
  if (!meta || lessons.length === 0) return undefined;
  return {
    href: `/training/${trackId}`,
    title: meta.title,
    description: meta.blurb,
    kind: "track",
    trackId,
  };
}

/**
 * 1–3 Training destinations for a news/release item.
 * Prefers lessons that share tool tags; if none, falls back to the matching
 * track index (only when that track exists and has lessons). Never emits a
 * href that the catalog cannot resolve.
 */
export function getRelatedTrainingLinks({
  topics,
  title = "",
  limit = 3,
}: {
  topics: readonly Topic[];
  title?: string;
  limit?: number;
}): RelatedTrainingLink[] {
  const cap = Math.min(Math.max(limit, 0), 3);
  if (!topics.length || cap === 0) return [];

  const mappedTracks = tracksForTopics(topics);
  const ranked = getAllLessons()
    .map((lesson) => ({
      lesson,
      score: scoreLesson(lesson, topics, title, mappedTracks),
    }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score);

  const links: RelatedTrainingLink[] = [];
  const seen = new Set<string>();

  for (const { lesson } of ranked) {
    if (links.length >= cap) break;
    const href = `/training/${lesson.track}/${lesson.slug}`;
    if (seen.has(href)) continue;
    seen.add(href);
    links.push({
      href,
      title: lesson.title,
      description: lesson.description,
      kind: "lesson",
      trackId: lesson.track,
    });
  }

  if (links.length === 0) {
    for (const trackId of mappedTracks) {
      if (links.length >= cap) break;
      const fallback = trackIndexLink(trackId);
      if (!fallback || seen.has(fallback.href)) continue;
      seen.add(fallback.href);
      links.push(fallback);
    }
  }

  return links;
}
