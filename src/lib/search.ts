import { getAllNews, getAllLessons, getAllReleases, getAllShortcuts } from "./content";
import { TRACK_IDS } from "./tracks";
import type { ContentKind, SearchResult } from "./types";

const TRACK_QUERY = new Set<string>(TRACK_IDS);

function hay(...parts: (string | string[] | undefined)[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []))
    .join(" ")
    .toLowerCase();
}

function isShortToken(q: string): boolean {
  return !q.includes(" ") && q.length <= 4;
}

function scoreHay(q: string, title: string, strong: string, summary: string, body = ""): number | null {
  const t = title.toLowerCase();
  const s = strong.toLowerCase();
  const sum = summary.toLowerCase();
  const b = body.toLowerCase();

  let score = 0;
  if (t === q) score += 100;
  else if (t.startsWith(q)) score += 70;
  else if (t.includes(q)) score += 50;

  if (s.split(/[^a-z0-9]+/).includes(q) || s.includes(q)) score += 40;
  if (sum.includes(q)) score += 15;

  const strongHit = score > 0;
  if (b.includes(q)) {
    if (isShortToken(q) && !strongHit) return null;
    if (!isShortToken(q)) score += 5;
  }

  return score > 0 ? score : null;
}

type Ranked = SearchResult & { score: number };

const KIND_RANK: Record<ContentKind, number> = {
  training: 0,
  shortcut: 1,
  news: 2,
  release: 3,
};

export function searchContent(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const ranked: Ranked[] = [];

  for (const n of getAllNews()) {
    const score = scoreHay(q, n.title, hay(n.topics, n.source), n.summary, n.whyItMatters);
    if (score == null) continue;
    ranked.push({
      kind: "news",
      slug: n.slug,
      title: n.title,
      summary: n.summary,
      href: `/news/${n.slug}`,
      topics: n.topics,
      score,
    });
  }

  for (const l of getAllLessons()) {
    // “git” / “sql” should list that track (and title hits), not every lesson
    // that merely tags the topic — those feel like junk next to real Git lessons.
    if (TRACK_QUERY.has(q) && l.track !== q && !l.title.toLowerCase().includes(q)) {
      continue;
    }
    const score = scoreHay(q, l.title, hay(l.topics, l.track), l.description, l.content);
    if (score == null) continue;
    ranked.push({
      kind: "training",
      slug: l.slug,
      title: l.title,
      summary: l.description,
      href: `/training/${l.track}/${l.slug}`,
      topics: l.topics,
      score,
    });
  }

  for (const r of getAllReleases()) {
    const score = scoreHay(
      q,
      r.title,
      hay(r.topics, r.product),
      r.summary,
      hay(r.whyReadNow, r.whatChanged),
    );
    if (score == null) continue;
    ranked.push({
      kind: "release",
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      href: `/releases/${r.slug}`,
      topics: r.topics,
      score,
    });
  }

  for (const s of getAllShortcuts()) {
    const tipText = s.tips
      .map((t) => `${t.title} ${t.body} ${t.code ?? ""} ${t.group ?? ""} ${t.source ?? ""}`)
      .join(" ");
    const sourceText = (s.sources ?? []).map((x) => x.label).join(" ");
    const score = scoreHay(
      q,
      s.title,
      hay(s.topics, s.category, s.tool),
      s.summary,
      hay(tipText, sourceText),
    );
    if (score == null) continue;
    ranked.push({
      kind: "shortcut",
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      href: `/shortcuts/${s.slug}`,
      topics: s.topics,
      score,
    });
  }

  ranked.sort((a, b) => b.score - a.score || KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.title.localeCompare(b.title));
  return ranked.map(({ score: _score, ...hit }) => hit);
}
