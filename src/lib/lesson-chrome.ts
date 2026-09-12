import { ZERO_TO_HERO_HREF, ZERO_TO_HERO_SPINE } from "@/lib/learner-paths";
import { getTrackMeta, isElectiveTrack } from "@/lib/tracks";
import type { CheatSheetEntry, TrackId } from "@/lib/types";

export type PathCrumb = {
  pathLabel: string;
  pathHref: string;
  levelLabel: string;
  position?: { index: number; total: number };
};

export type ShortcutPackLink = {
  href: string;
  title: string;
};

const TRACK_SHORTCUT_PACK: Partial<Record<TrackId, ShortcutPackLink>> = {
  sql: { href: "/shortcuts/sql-pyspark-windows", title: "SQL / PySpark pack" },
  databricks: { href: "/shortcuts/databricks-cli-sql-cheatsheet", title: "Databricks CLI / SQL pack" },
  snowflake: { href: "/shortcuts/snowflake-sql-cli-cheatsheet", title: "Snowflake SQL & SnowSQL pack" },
  python: { href: "/shortcuts/python-de-cli-snippets", title: "Python DE CLI pack" },
  git: { href: "/shortcuts/git-keyboard-cli", title: "Git keyboard & CLI pack" },
  "prompt-engineering": { href: "/shortcuts/claude-anthropic-pack", title: "Claude shortcuts pack" },
  "ai-data-eng": { href: "/shortcuts/snowflake-cortex-ai", title: "Snowflake Cortex AI pack" },
  "forward-deployed": { href: "/shortcuts/vscode-cursor-keyboard", title: "Editor keyboard pack" },
};

/** First coded cheat-sheet row is the Example; the rest are leftovers + extra TryIts. */
export function splitLessonExamples(entries: CheatSheetEntry[] | undefined) {
  const list = entries ?? [];
  const exampleIndex = list.findIndex((e) => e.code?.trim());
  if (exampleIndex < 0) {
    return { example: undefined, extraExamples: [] as CheatSheetEntry[], leftover: list };
  }
  const example = list[exampleIndex];
  const extraExamples = list.slice(exampleIndex + 1).filter((e) => e.code?.trim());
  const leftover = list.filter((_, i) => i !== exampleIndex);
  return { example, extraExamples, leftover };
}

export function shortcutPackForTrack(track: string): ShortcutPackLink | undefined {
  return TRACK_SHORTCUT_PACK[track as TrackId];
}

export function tryItDialectForTrack(track: string): string {
  if (track === "sql") return "ANSI SQL";
  if (track === "snowflake") return "Snowflake SQL";
  if (track === "databricks") return "Spark SQL / PySpark";
  if (track === "python") return "Python";
  if (track === "git") return "Git";
  if (track === "forward-deployed") return "FDE checklist";
  return "AI chat";
}

/**
 * Path crumb when the lesson maps to Zero→Hero, an elective, or a skill path.
 * Guest pages always have this context from the route — no auth session required.
 */
export function pathCrumbForLesson(track: string, slug: string): PathCrumb | null {
  const spine = ZERO_TO_HERO_SPINE.filter((s) => s.track === track && s.slug === slug)[0];
  if (spine) {
    const peers = ZERO_TO_HERO_SPINE.filter((s) => s.level === spine.level);
    const index = peers.findIndex((s) => s.track === track && s.slug === slug);
    return {
      pathLabel: "Zero→Hero",
      pathHref: ZERO_TO_HERO_HREF,
      levelLabel: spine.level === "L1" ? "L1 SQL" : spine.level === "L2" ? "L2 Python" : spine.level,
      position: index >= 0 ? { index: index + 1, total: peers.length } : undefined,
    };
  }

  const meta = getTrackMeta(track);
  if (!meta) return null;

  if (isElectiveTrack(track)) {
    return {
      pathLabel: "Elective",
      pathHref: `/training/${track}`,
      levelLabel: meta.pathLevel ?? meta.title,
    };
  }

  if (track === "git") {
    return {
      pathLabel: "Skill path",
      pathHref: `/training/${track}`,
      levelLabel: meta.title,
    };
  }

  return {
    pathLabel: "Zero→Hero",
    pathHref: ZERO_TO_HERO_HREF,
    levelLabel: meta.pathLevel ?? meta.title,
  };
}
