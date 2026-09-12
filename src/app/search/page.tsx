import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { TopicBadge, SoftBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { searchContent } from "@/lib/search";
import { SectionHeader } from "@/components/SectionHeader";
import type { ContentKind, SearchResult } from "@/lib/types";

const KIND_ORDER: ContentKind[] = ["training", "news", "shortcut", "release"];

const KIND_LABELS: Record<ContentKind, string> = {
  training: "Lessons",
  news: "News",
  shortcut: "Shortcuts",
  release: "Releases",
};

function resultCountLabel(n: number, q: string) {
  const noun = n === 1 ? "result" : "results";
  return `${n} ${noun} for “${q}”`;
}

function groupResults(results: SearchResult[]) {
  const groups = new Map<ContentKind, SearchResult[]>();
  for (const kind of KIND_ORDER) groups.set(kind, []);
  for (const r of results) {
    const list = groups.get(r.kind);
    if (list) list.push(r);
    else groups.set(r.kind, [r]);
  }
  return KIND_ORDER.map((kind) => ({ kind, items: groups.get(kind) ?? [] })).filter(
    (g) => g.items.length > 0,
  );
}

export const metadata: Metadata = {
  title: "Search",
  description: "Search across news, training, releases, and shortcuts.",
};

export const dynamic = "force-dynamic";

function SearchResults({ q }: { q: string }) {
  const results = q ? searchContent(q) : [];
  const groups = groupResults(results);

  return (
    <div className="mt-8">
      {q ? (
        <p className="mb-4 text-sm font-semibold text-[var(--ink-fg)]" role="status">
          {resultCountLabel(results.length, q)}
        </p>
      ) : null}
      {!q ? (
        <EmptyState
          title="Search the hub"
          body="Try “window”, “Snowflake”, “rebase”, “Photon”, or “watermark”."
        />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" body={`Nothing found for “${q}”.`} />
      ) : (
        <div className="space-y-8">
          {groups.map(({ kind, items }) => (
            <section key={kind} aria-label={KIND_LABELS[kind]}>
              <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sky)]">
                {KIND_LABELS[kind]} · {items.length}
              </p>
              <ul className="space-y-3">
                {items.map((r) => (
                  <li key={`${r.kind}-${r.slug}`}>
                    <Link
                      href={r.href}
                      className="group glass glass-hover block rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)]"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <SoftBadge>{KIND_LABELS[r.kind]}</SoftBadge>
                        {r.topics.slice(0, 2).map((t) => (
                          <TopicBadge key={t} topic={t} />
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-[var(--ink-fg)] group-hover:text-[var(--coral)] group-focus-visible:text-[var(--violet)]">
                        {r.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{r.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

async function SearchInner({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <div>
      <SectionHeader
        eyebrow="Search"
        title="Find anything in the hub"
        description="Full-text style scan across curated content."
      />
      <SearchBox initialQuery={q} />
      <SearchResults q={q.trim()} />
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-[var(--muted)]">Loading search…</div>
      }
    >
      <SearchInner searchParams={searchParams} />
    </Suspense>
  );
}
