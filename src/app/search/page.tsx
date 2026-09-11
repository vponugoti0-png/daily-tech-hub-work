import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { TopicBadge, SoftBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { searchContent } from "@/lib/search";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across news, training, releases, and shortcuts.",
};

function SearchResults({ q }: { q: string }) {
  const results = q ? searchContent(q) : [];

  return (
    <div className="mt-8">
      {!q ? (
        <EmptyState
          title="Search the hub"
          body="Try “window”, “Snowflake”, “rebase”, “Photon”, or “watermark”."
        />
      ) : results.length === 0 ? (
        <EmptyState title="No matches" body={`Nothing found for “${q}”.`} />
      ) : (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={`${r.kind}-${r.slug}`}>
              <Link
                href={r.href}
                className="group glass glass-hover block rounded-2xl p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)]"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <SoftBadge className="capitalize">{r.kind}</SoftBadge>
                  {r.topics.slice(0, 3).map((t) => (
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
