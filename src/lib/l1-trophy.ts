import type { LessonProgress, ProgressState } from "@/lib/progress";

/** Headline L1 verbs — string-template only, no lesson-table lookup. */
export const TRANSFER_SKILLS = [
  { slug: "sql-select-filter-nulls", verb: "filter" },
  { slug: "sql-aggregates-group-having", verb: "aggregate" },
  { slug: "sql-joins-set-logic-recap", verb: "join" },
] as const;

export const TRANSFER_NEXT = "Staging and incremental loads are next.";

/** Dirty aurora_orders → daily-revenue gold. Original Aurora seed, not a warehouse. */
export const DIRTY_ORDERS_SNIPPET = `SELECT
  o.order_date,
  COUNT(*) AS paid_orders,
  ROUND(SUM(o.amount), 2) AS daily_revenue
FROM aurora_orders o
WHERE o.status = 'paid'
GROUP BY o.order_date
ORDER BY o.order_date;`;

export const DIRTY_ORDERS_README = `# gold.daily_revenue
Grain is one row per paid order_date from aurora_orders.
Dirty statuses stay out of this mart.`;

export const L1_TROPHY_METRICS = [
  {
    id: "freshness",
    label: "Freshness",
    value: "2026-09-10",
    hint: "MAX(order_date) on paid aurora_orders",
  },
  {
    id: "volume",
    label: "Volume",
    value: "8 paid → 6 days",
    hint: "Paid rows collapsed to the daily grain",
  },
  {
    id: "cost",
    label: "Cost",
    value: "0 credits",
    hint: "Local DuckDB seed — not a warehouse bill",
  },
  {
    id: "failure",
    label: "Failure",
    value: "6 dirty held out",
    hint: "pending, cancelled, and returned never enter gold",
  },
] as const;

export function lessonKeySlug(key: string): string {
  const idx = key.indexOf(":");
  return idx >= 0 ? key.slice(idx + 1) : key;
}

export function completedSlugIds(
  lessons: Record<string, Pick<LessonProgress, "completed"> | undefined>,
): string[] {
  const slugs: string[] = [];
  for (const [key, value] of Object.entries(lessons)) {
    if (!value?.completed) continue;
    slugs.push(lessonKeySlug(key));
  }
  return slugs;
}

export function formatAndList(words: string[]): string {
  if (words.length === 0) return "";
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(", ")}, and ${words[words.length - 1]}`;
}

/**
 * Transfer sentence from the completed-slug array.
 * Pure string templating — no database expansion of titles or skills.
 */
export function transferSentence(completedSlugs: readonly string[]): string {
  const have = new Set(completedSlugs);
  const verbs = TRANSFER_SKILLS.filter((s) => have.has(s.slug)).map((s) => s.verb);
  if (!verbs.length) return TRANSFER_NEXT;
  return `You can now ${formatAndList(verbs)}. ${TRANSFER_NEXT}`;
}

export type TranscriptPayload = {
  exportedAt: string;
  source: "guest-progress";
  completedSlugIds: string[];
  lessons: ProgressState["lessons"];
  placement?: ProgressState["placement"];
};

export function buildTranscriptPayload(
  state: ProgressState,
  exportedAt = new Date().toISOString(),
): TranscriptPayload {
  return {
    exportedAt,
    source: "guest-progress",
    completedSlugIds: completedSlugIds(state.lessons),
    lessons: state.lessons,
    ...(state.placement ? { placement: state.placement } : {}),
  };
}

export function transcriptJson(state: ProgressState, exportedAt?: string): string {
  return `${JSON.stringify(buildTranscriptPayload(state, exportedAt), null, 2)}\n`;
}

export function transcriptMarkdown(state: ProgressState, exportedAt?: string): string {
  const payload = buildTranscriptPayload(state, exportedAt);
  const slugs = payload.completedSlugIds.length
    ? payload.completedSlugIds.map((s) => `- ${s}`).join("\n")
    : "- (none yet)";
  const rows = Object.entries(payload.lessons)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const flag = value.completed ? "complete" : "in progress";
      return `- \`${key}\` — ${flag} (${value.updatedAt})`;
    });
  const lessonBlock = rows.length ? rows.join("\n") : "- (none yet)";
  const placement = payload.placement
    ? `Landing ${payload.placement.landingLevel} at ${payload.placement.setAt}`
    : "None";

  return [
    "# Aurora transcript",
    "",
    `Exported: ${payload.exportedAt}`,
    "Source: guest progress on this device",
    "",
    "## Completed slug ids",
    slugs,
    "",
    "## Lesson progress",
    lessonBlock,
    "",
    "## Placement",
    placement,
    "",
  ].join("\n");
}

export function downloadTextFile(filename: string, body: string, mime: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
